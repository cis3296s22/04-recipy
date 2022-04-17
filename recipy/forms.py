from django.contrib.auth import get_user_model
from django import forms

User = get_user_model()

class RegistrationForm(forms.ModelForm):
    password = forms.CharField(label='Password', widget=forms.PasswordInput)
    confirm = forms.CharField(label='Confirm', widget=forms.PasswordInput)

    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name']

    def clean_password(self):
        password = self.cleaned_data.get('password')
        confirm = self.cleaned_data.get('confirm')
        if password and confirm and password != confirm:
            raise forms.ValidationError("Passwords do not match")
        return password

    def save(self, commit=True):
        user = super(RegistrationForm, self).save(commit=False)
        user.set_password(self.cleaned_data['password'])

        if commit:
            user.save()

        return user
