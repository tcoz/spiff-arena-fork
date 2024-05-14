"""empty message

Revision ID: d4b900e71852
Revises: c6e246c3c04e
Create Date: 2024-05-02 16:21:48.287934

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'd4b900e71852'
down_revision = 'c6e246c3c04e'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('process_caller_relationship',
    sa.Column('called_reference_cache_process_id', sa.Integer(), nullable=False),
    sa.Column('calling_reference_cache_process_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['called_reference_cache_process_id'], ['reference_cache.id'], name='called_reference_cache_process_id_fk'),
    sa.ForeignKeyConstraint(['calling_reference_cache_process_id'], ['reference_cache.id'], name='calling_reference_cache_process_id_fk'),
    sa.PrimaryKeyConstraint('called_reference_cache_process_id', 'calling_reference_cache_process_id', name='process_caller_relationship_pk')
    )
    with op.batch_alter_table('process_caller_relationship', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_process_caller_relationship_called_reference_cache_process_id'), ['called_reference_cache_process_id'], unique=False)
        batch_op.create_index(batch_op.f('ix_process_caller_relationship_calling_reference_cache_process_id'), ['calling_reference_cache_process_id'], unique=False)

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('process_caller_relationship', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_process_caller_relationship_calling_reference_cache_process_id'))
        batch_op.drop_index(batch_op.f('ix_process_caller_relationship_called_reference_cache_process_id'))

    op.drop_table('process_caller_relationship')
    # ### end Alembic commands ###