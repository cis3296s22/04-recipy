from django.db import migrations
from django.contrib.postgres.operations import *

### This migration cannot be applied as things are.
### These extensions must be created manually as the root user.

class Migration(migrations.Migration):
    operations = [
        CreateExtension('pg_stat_statements'),
        CreateExtension('uuid-ossp'),
        TrigramExtension(), # pg_trgm
        BtreeGistExtension(), # btree_gist
        BtreeGinExtension(), # btree_gin
        HStoreExtension(), # hstore
    ]
