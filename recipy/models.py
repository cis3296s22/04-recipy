from django.db import models
from django.contrib.auth.models import AbstractUser

def _timedelta_to_dict(td):
    v = td.seconds
    seconds = v % 60
    v -= seconds
    v /= 60
    minutes = v % 60
    v -= minutes
    v /= 60
    hours = v

    return dict(
        seconds=int(seconds),
        minutes=int(minutes),
        hours=int(hours)
    )

class BaseModel(models.Model):
    """
    Base model from which other models inherit. Provides created_at/
    updated_at functionality.
    """
    created_at = models.DateTimeField(auto_now_add=True, editable=False)
    updated_at = models.DateTimeField(auto_now=True, editable=False)

    class Meta:
        abstract = True

    def to_json(self):
        return None

class Chef(AbstractUser, BaseModel):
    """
    Django User model.
    """
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
    """
    Stores information about a single piece of equipment, to be used with :model:`recipy.Step`.
    """
    name = models.TextField(null=False)
    maker = models.TextField(null=False)
    kind = models.TextField(null=False)

    def to_json(self):
        return dict(
            id=self.id,
            name=self.name,
            maker=self.maker,
            kind=self.kind
        )

class Recipe(BaseModel):
    """
    Represents a recipe.
    """
    owner = models.ForeignKey(Chef, on_delete=models.CASCADE, null=False)
    name = models.TextField()
    description = models.TextField()
    makes = models.IntegerField(default=1, null=False)
    picture_width = models.IntegerField(default=0, null=True, blank=True)
    picture_height = models.IntegerField(default=0, null=True, blank=True)
    picture = models.ImageField(upload_to='recipe-images/',
                                        null=True, blank=True,
                                        height_field='picture_height',
                                        width_field='picture_width')

    def to_json(self):
        d = dict(
            id=self.id,
            owner=self.owner.to_json(),
            name=self.name,
            description=self.description,
            makes=self.makes,
            steps=[s.to_json() for s in Step.objects.filter(recipe_id=self.id)]
        )
        if self.picture:
            d['picture'] = dict(
		url=self.picture.url,
                width=self.picture_width,
                height=self.picture_height
            )
        return d

class Process(BaseModel):
    name = models.TextField()
    description = models.TextField()

    @classmethod
    def from_json(cls, j):
        return Process(name=j.get('name'), description=j.get('description'))

    def to_json(self):
        return dict(id=self.id, name=self.name, description=self.description)

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

    @classmethod
    def from_json(cls, j):
        pass

    def to_json(self):
        return dict(
            id=self.id,
            name=self.name,
            calories=self.calories,
            serving_size=dict(
                units=self.serving_size_units,
                value=self.serving_size
            )
        )

class Step(BaseModel):
    order = models.IntegerField(null=False)
    recipe = models.ForeignKey(Recipe, on_delete=models.DO_NOTHING, null=False)
    process = models.ForeignKey(Process, on_delete=models.DO_NOTHING, null=False)
    time = models.DurationField()
    equipment = models.ManyToManyField(Equipment)

    def to_json(self):
        return dict(
            id=self.id,
            equipment=[e.to_json() for e in self.equipment.all()],
            order=self.order,
            process=self.process.to_json() if self.process else None,
            time=_timedelta_to_dict(self.time),
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
            **(self.ingredient.to_json()),
            ingredient_usage_id=self.id,
            amount=dict(
                value=self.amount,
                units=self.amount_units
            )
        ) 
