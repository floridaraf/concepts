# Generated by Django 2.2.12 on 2020-10-09 13:43

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('network', '0008_auto_20201009_1326'),
    ]

    operations = [
        migrations.AddField(
            model_name='post',
            name='pictures',
            field=models.ImageField(blank=True, upload_to=''),
        ),
    ]
