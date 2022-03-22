from django.db import models

class BaseModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True, editable=False)
    updated_at = models.DateTimeField(auto_now=True, editable=False)

    class Meta:
        abstract = True

class Equipment(BaseModel):
    pass

class Recipe(BaseModel):
    pass

class RecipeStep(BaseModel):
    recipe = models.ForeignKey(Recipe, on_delete=models.DO_NOTHING)

class Ingredient(BaseModel):
    pass

class RecipeIngredient(Ingredient):
    recipe = models.ForeignKey(Recipe, on_delete=models.DO_NOTHING)
    equipment = models.ManyToManyField(Equipment)
