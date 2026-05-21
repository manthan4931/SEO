import os
import django
from django.db import connection

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

print("--- ALL DATABASE TABLES ---")
table_names = connection.introspection.table_names()
for name in sorted(table_names):
    print(name)
