from flask_wtf import FlaskForm
from wtforms import PasswordField, SubmitField, validators
from wtforms.fields.html5 import EmailField


class RegistrationForm(FlaskForm):
    email = EmailField('email', validators=[validators.DataRequired(),
                                            validators.Email()])
    password = PasswordField('password',
     validators=[validators.DataRequired(), validators.Length(min=8, message="Please use at least 8 character.")])
    confirm_password = PasswordField('confirm_password', validators=[validators.DataRequired(),
       validators.EqualTo('password', message='Passwords must match')])
    submit = SubmitField('Submit', validators=[validators.DataRequired()])


class LoginForm(FlaskForm):
    email = EmailField('email', validators=[validators.DataRequired(), validators.Email()])
    password = PasswordField('password', validators=[
        validators.Length(min=2,
                          message="Please use at least 8 character.")
    ])
    submit = SubmitField('Login', validators=[validators.DataRequired()])