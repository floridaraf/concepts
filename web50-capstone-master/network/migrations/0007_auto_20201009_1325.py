# Generated by Django 2.2.12 on 2020-10-09 13:25

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('network', '0006_auto_20201009_0533'),
    ]

    operations = [
        migrations.AlterField(
            model_name='post',
            name='closed',
            field=models.BooleanField(),
        ),
    ]