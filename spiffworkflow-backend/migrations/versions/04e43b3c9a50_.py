"""empty message

Revision ID: 04e43b3c9a50
Revises: def2cbb0ca6b
Create Date: 2023-03-03 10:31:53.578474

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = '04e43b3c9a50'
down_revision = 'def2cbb0ca6b'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.alter_column('bpmn_process_definition', 'type',
               existing_type=mysql.VARCHAR(length=32),
               nullable=True)
    op.drop_index('ix_bpmn_process_definition_type', table_name='bpmn_process_definition')
    op.add_column('process_instance', sa.Column('spiff_serializer_version', sa.String(length=50), nullable=True))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('process_instance', 'spiff_serializer_version')
    op.create_index('ix_bpmn_process_definition_type', 'bpmn_process_definition', ['type'], unique=False)
    op.alter_column('bpmn_process_definition', 'type',
               existing_type=mysql.VARCHAR(length=32),
               nullable=False)
    # ### end Alembic commands ###
