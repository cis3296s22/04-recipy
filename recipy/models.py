from django.db import models
from django.contrib.auth.models import AbstractUser

class BaseModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True, editable=False)
    updated_at = models.DateTimeField(auto_now=True, editable=False)

    class Meta:
        abstract = True

class Chef(AbstractUser, BaseModel):
    profile_picture_width = models.IntegerField(default=0, null=True, blank=True)
    profile_picture_height = models.IntegerField(default=0, null=True, blank=True)
    profile_picture = models.ImageField(upload_to='chef-profile-images/',
                                        null=True, blank=True,
                                        height_field='profile_picture_height',
                                        width_field='profile_picture_width')

class Equipment(BaseModel):
    name = models.TextField()

class Recipe(BaseModel):
    owner = models.ForeignKey(Chef, on_delete=models.CASCADE)

class Ingredient(BaseModel):
    name = models.TextField()

class Step(BaseModel):
    class TimeUnit(Models.IntegerChoices):
        SECOND = 1, 'Second'
        MINUTE = 2, 'Minutes'
        HOUR = 2, "Hours"
        DAY = 3, "Days"

    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE)
    ingredients = models.ManyToMany(Ingredient)
    equipment = models.ManyToMany(Equipment)
    time = models.FloatField()
    time_units = models.IntegerField(
        choices=TimeUnit.choices,
        default=TimeUnit.MINUTE,
    ) 
