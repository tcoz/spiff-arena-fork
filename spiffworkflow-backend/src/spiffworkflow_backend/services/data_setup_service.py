import os
from collections import Counter
from typing import Any

from flask import current_app

from spiffworkflow_backend.data_stores.json import JSONDataStore
from spiffworkflow_backend.data_stores.kkv import KKVDataStore
from spiffworkflow_backend.models.db import db
from spiffworkflow_backend.models.json_data_store import JSONDataStoreModel
from spiffworkflow_backend.models.kkv_data_store import KKVDataStoreModel
from spiffworkflow_backend.models.process_group import ProcessGroup
from spiffworkflow_backend.models.reference_cache import ReferenceCacheModel
from spiffworkflow_backend.models.reference_cache import ReferenceType
from spiffworkflow_backend.services.file_system_service import FileSystemService
from spiffworkflow_backend.services.process_model_service import ProcessModelService
from spiffworkflow_backend.services.reference_cache_service import ReferenceCacheService
from spiffworkflow_backend.services.spec_file_service import SpecFileService
from spiffworkflow_backend.models.message_model import MessageModel, MessageCorrelationPropertyModel

class DataSetupService:
    @classmethod
    def run_setup(cls) -> list:
        return cls.save_all_process_models()

    @classmethod
    def save_all_process_models(cls) -> list:
        """Build a cache of all processes, messages, correlation keys, and start events.

        These all exist within processes located on the file system, so we can quickly reference them
        from the database.
        """
        current_app.logger.debug("DataSetupService.save_all_process_models() start")

        failing_process_models = []
        files = FileSystemService.walk_files_from_root_path(True, None)
        reference_objects: dict[str, ReferenceCacheModel] = {}
        all_data_store_specifications: dict[tuple[str, str, str], Any] = {}
        all_message_models: dict[tuple[str, str], MessageModel] = {}

        for file in files:
            if FileSystemService.is_process_model_json_file(file):
                process_model = ProcessModelService.get_process_model_from_path(file)
                current_app.logger.debug(f"Process Model: {process_model.display_name}")
                try:
                    # FIXME: get_references_for_file_contents is erroring out for elements in the list
                    refs = SpecFileService.get_references_for_process(process_model)
                    for ref in refs:
                        try:
                            reference_cache = ReferenceCacheModel.from_spec_reference(ref)
                            ReferenceCacheService.add_unique_reference_cache_object(reference_objects, reference_cache)
                            SpecFileService.update_caches_except_process(ref)
                            db.session.commit()
                        except Exception as ex:
                            failing_process_models.append(
                                (
                                    f"{ref.relative_location}/{ref.file_name}",
                                    str(ex),
                                )
                            )
                except Exception as ex2:
                    failing_process_models.append(
                        (
                            f"{process_model.id}",
                            str(ex2),
                        )
                    )
            elif FileSystemService.is_data_store_json_file(file):
                relative_location = FileSystemService.relative_location(file)
                file_name = os.path.basename(file)
                (identifier, _) = os.path.splitext(file_name)
                reference_cache = ReferenceCacheModel.from_params(
                    identifier,
                    identifier,
                    "data_store",
                    file_name,
                    relative_location,
                    None,
                    False,
                )
                ReferenceCacheService.add_unique_reference_cache_object(reference_objects, reference_cache)
            elif FileSystemService.is_process_group_json_file(file):
                try:
                    process_group = ProcessModelService.find_or_create_process_group(os.path.dirname(file))
                except Exception:
                    current_app.logger.debug(f"Failed to load process group from file @ '{file}'")
                    continue

                cls._collect_data_store_specifications(process_group, file, all_data_store_specifications)
                cls._collect_message_models(process_group, file, all_message_models)

        current_app.logger.debug("DataSetupService.save_all_process_models() end")
        ReferenceCacheService.add_new_generation(reference_objects)
        cls._sync_data_store_models_with_specifications(all_data_store_specifications)
        cls._save_all_message_models(all_message_models)

        return failing_process_models

    @classmethod
    def _collect_data_store_specifications(
        cls, process_group: ProcessGroup, file_name: str, all_data_store_specifications: dict[tuple[str, str, str], Any]
    ) -> None:
        for data_store_type, specs_by_id in process_group.data_store_specifications.items():
            if not isinstance(specs_by_id, dict):
                current_app.logger.debug(f"Expected dictionary as value for key '{data_store_type}' in file @ '{file_name}'")
                continue

            for identifier, specification in specs_by_id.items():
                location = specification.get("location")
                if location is None:
                    current_app.logger.debug(
                        f"Location missing from data store specification '{identifier}' in file @ '{file_name}'"
                    )
                    continue

                all_data_store_specifications[(data_store_type, location, identifier)] = specification

    @classmethod
    def _message_model_from_message(cls, message: dict[str, Any], file: str) -> MessageModel | None:
        identifier = message.get("id")
        location = message.get("location")
        schema = message.get("schema")

        if not identifier or not location or not schema:
            current_app.logger.debug(f"Malformed message: '{message}' in file @ '{file}'")
            return None

        return MessageModel(identifier=identifier, location=location, schema=schema)

    @classmethod
    def _correlation_property_models_from_group(cls, correlation_property_group: list[dict[str, Any]], file: str) -> dict[str, list[MessageCorrelationPropertyModel]]:
        models = {}

        for item in correlation_property_group:
            identifier = item.get("id")
            retrieval_expressions = item.get("retrieval_expressions")

            if not identifier or not retrieval_epxressions:
                current_app.logger.debug(f"Malformed correlation property: '{item}' in file @ '{file}'")
                continue

            for expression in retrieval_expressions:
                message_identifier = expression.get("message_ref")
                retrieval_expression = expression.get("formal_expression")

                if not message_identifier or not retrieval_expression:
                    current_app.logger.debug(f"Malformed retrieval expression: '{expression}' in file @ '{file}'")
                    continue

                if message_identifier not in models:
                    models[message_identifier] = []

                models[message_identifier].append(MessageCorrelationPropertyModel(identifier=identifier, retrieval_expression=retrieval_expression))
                
        return models
                
    @classmethod
    def _collect_message_models(
        cls, process_group: ProcessGroup, file_name: str, all_message_models: dict[tuple[str, str], MessageModel]
    ) -> None:
        messages = process_group.messages or []
        local_message_models = {}

        for message in messages:
            message_model = cls._message_model_from_message(message, file)
            if message_model is None:
                continue
            local_message_models[mesage_model.identifier] = message_model
            all_message_models[(message_model.identifier, message_model.location)] = message_model
            
        correlation_property_models_by_message_identifier = cls._correlation_property_models_from_group(process_group.correlation_properties or [])

        for message_identifier, correlation_property_models in correlation_property_models_by_message_identifier:
            message_model = local_message_models.get(message_identifier)

            if message_model is None:
                current_app.logger.debug(f"Correlation property references message that is not defined: '{message_identifier}' in file @ '{file}'")
                continue

            message_model.correlation_properties = correlation_property_models

    @classmethod
    def _sync_data_store_models_with_specifications(cls, all_data_store_specifications: dict[tuple[str, str, str], Any]) -> None:
        all_data_store_models: dict[tuple[str, str, str], Any] = {}

        kkv_models = db.session.query(KKVDataStoreModel).all()
        json_models = db.session.query(JSONDataStoreModel).all()

        for kkv_model in kkv_models:
            all_data_store_models[("kkv", kkv_model.location, kkv_model.identifier)] = kkv_model

        for json_model in json_models:
            all_data_store_models[("json", json_model.location, json_model.identifier)] = json_model

        specification_keys = set(all_data_store_specifications.keys())
        model_keys = set(all_data_store_models.keys())

        #
        # At this point we have a dictionary of all data store specifications from all the process_group.json files and
        # a dictionary of all data store models. These two dictionaries use the same key format of (type, location, identifier)
        # which allows checking to see if a given data store has a specification and/or a model.
        #
        # With this we can perform set operations on the keys of the two dictionaries to figure out what needs to be
        # inserted, updated or deleted. If a key has a specification but not a model, an insert needs to happen. If a key
        # has a specification and a model, an update needs to happen. If a key has a model but no specification, a delete
        # needs to happen.
        #

        keys_to_insert = specification_keys - model_keys
        keys_to_update = specification_keys & model_keys
        keys_to_delete = model_keys - specification_keys

        current_app.logger.debug(f"DataSetupService: all_data_store_specifications: {all_data_store_specifications}")
        current_app.logger.debug(f"DataSetupService: all_data_store_models: {all_data_store_models}")
        current_app.logger.debug(f"DataSetupService: keys_to_insert: {keys_to_insert}")
        current_app.logger.debug(f"DataSetupService: keys_to_update: {keys_to_update}")
        current_app.logger.debug(f"DataSetupService: keys_to_delete: {keys_to_delete}")

        model_creators = {
            "kkv": KKVDataStore.create_instance,
            "json": JSONDataStore.create_instance,
        }

        def update_model_from_specification(model: Any, key: tuple[str, str, str]) -> None:
            specification = all_data_store_specifications.get(key)
            if specification is None:
                current_app.logger.debug(
                    f"DataSetupService: was expecting key '{key}' to point to a data store specification for model updating."
                )
                return

            name = specification.get("name")
            schema = specification.get("schema")

            if name is None or schema is None:
                current_app.logger.debug(
                    f"DataSetupService: was expecting key '{key}' to point to a valid data store specification for model"
                    " updating."
                )
                return

            model.name = name
            model.schema = schema
            model.description = specification.get("description")

        for key in keys_to_insert:
            data_store_type, location, identifier = key

            if data_store_type not in model_creators:
                current_app.logger.debug(f"DataSetupService: cannot create model for type '{data_store_type}'.")
                continue

            model = model_creators[data_store_type](identifier, location)
            update_model_from_specification(model, key)
            db.session.add(model)

        for key in keys_to_update:
            model = all_data_store_models.get(key)
            if model is None:
                current_app.logger.debug(
                    f"DataSetupService: was expecting key '{key}' to point to a data store model for model updating."
                )
                continue
            update_model_from_specification(model, key)

        for key in keys_to_delete:
            model = all_data_store_models.get(key)
            if model is None:
                current_app.logger.debug(f"DataSetupService: was expecting key '{key}' to point to a data store model to delete.")
                continue
            db.session.delete(model)

        db.session.commit()

    @classmethod
    def _save_all_message_models(
        cls, all_message_models: dict[tuple[str, str], MessageModel]
    ) -> None:
        pass
    
