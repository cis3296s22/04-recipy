from django.db import models
from django.contrib.auth.models import AbstractUser

class BaseModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True, editable=False)
    updated_at = models.DateTimeField(auto_now=True, editable=False)

    class Meta:
        abstract = True

    def to_json(self):
        return None

class Chef(AbstractUser, BaseModel):
    profile_picture_width = models.IntegerField(default=0, null=True, blank=True)
    profile_picture_height = models.IntegerField(default=0, null=True, blank=True)
    profile_picture = models.ImageField(upload_to='chef-profile-images/',
                                        null=True, blank=True,
                                        height_field='profile_picture_height',
                                        width_field='profile_picture_width')

    def to_json(self):
        d = dict(
            id=self.id,
            username=self.username,
            first_name=self.first_name,
            last_name=self.last_name
        )

        if self.profile_picture:
            d['profile_picture'] = dict(
                url=self.profile_picture.url,
                width=self.profile_picture_width,
                height=self.profile_picture_height 
            )

        return d

class Equipment(BaseModel):
    name = models.TextField(null=False)
    maker = models.TextField(null=False)
    kind = models.TextField(null=False)

    def to_json(self):
        return dict(
            name=self.name,
            maker=self.maker,
            kind=self.kind
        )

class Recipe(BaseModel):
    owner = models.ForeignKey(Chef, on_delete=models.CASCADE, null=False)
    name = models.TextField()
    description = models.TextField()

    def to_json(self):
        return dict(
            owner=self.owner.to_json(),
            name=self.name,
            description=self.description,
            steps=[s.to_json() for s in Step.objects.filter(recipe_id=self.id)]
        )

class Process(BaseModel):
    name = models.TextField()
    description = models.TextField()

    def to_json(self):
        return dict(name=self.name, description=self.description)

class Ingredient(BaseModel):
    class Units(models.IntegerChoices):
        G = 1, 'Grams'
        KG = 2, 'Kilograms'
        ML = 3, 'Milliliters'
        L = 4, 'Liters'
        SPCH = 5, 'Pinches'
        UNIT = 6, 'Unit'
        
    name = models.TextField(null=False)
    calories = models.IntegerField(null=False)
    serving_size = models.IntegerField(null=False)
    serving_size_units = models.IntegerField(
        choices=Units.choices,
        default=Units.G,
        null=False
    )

    def to_json(self):
        return dict(
            name=self.name,
            calories=self.calories,
            serving_size=dict(
                units=self.serving_size_units,
                value=self.serving_size
            )
        )

class Step(BaseModel):
    class TimeUnit(models.IntegerChoices):
        SECOND = 1, 'Second'
        MINUTE = 2, 'Minutes'
        HOUR = 3, "Hours"
        DAY = 4, "Days"

    order = models.IntegerField(null=False)
    recipe = models.ForeignKey(Recipe, on_delete=models.DO_NOTHING, null=False)
    process = models.ForeignKey(Process, on_delete=models.DO_NOTHING, null=False)
    equipment = models.ManyToManyField(Equipment)
    time = models.FloatField(null=False)
    time_units = models.IntegerField(
        choices=TimeUnit.choices,
        default=TimeUnit.MINUTE,
        null=False
    )

    def to_json(self):
        return dict(
            equipment=[e.to_json() for e in self.equipment.all()],
            order=self.order,
            process=self.process.to_json() if self.process else None,
            time=self.time,
            time_units=self.time_units,
            ingredients=[x.to_json() for x in IngredientUsage.objects.filter(step=self)]
        )

class IngredientUsage(BaseModel):
    step = models.ForeignKey(Step, on_delete=models.DO_NOTHING)
    ingredient = models.ForeignKey(Ingredient, on_delete=models.DO_NOTHING)
    amount = models.IntegerField()
    amount_units = models.IntegerField(
        choices=Ingredient.Units.choices,
        default=Ingredient.Units.G
    )
  
    def to_json(self):
        return dict(
            ingredient=self.ingredient.to_json(),
            amount=dict(
                value=self.amount,
                units=self.amount_units
            )
        ) 
