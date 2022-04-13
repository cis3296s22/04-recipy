# Generated by Django 3.2 on 2022-04-07 21:18

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('recipy', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='recipe',
            name='picture',
            field=models.ImageField(blank=True, height_field='picture_height', null=True, upload_to='recipe-images/', width_field='picture_width'),
        ),
        migrations.AddField(
            model_name='recipe',
            name='picture_height',
            field=models.IntegerField(blank=True, default=0, null=True),
        ),
        migrations.AddField(
            model_name='recipe',
            name='picture_width',
            field=models.IntegerField(blank=True, default=0, null=True),
        ),
    ]