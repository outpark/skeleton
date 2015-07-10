from skeleton.extensions import auth
from skeleton.models import User
from flask import g, jsonify

#this one takes either password or token and verifies it.
@auth.verify_password
def verify_password(username_or_token, password):
    # first try to authenticate by token
    user = User.verify_auth_token(username_or_token)
    if not user:
        # try to authenticate with username/password
        user = User.query.filter_by(username = username_or_token).first()
        if not user or not user.check_password(password):
            return False
    g.user = user
    return True

#1이 실패 
@auth.error_handler
def auth_error():
    return jsonify({'status':'1'})

class Check:
    def __init__(self, target, me):
        self.target = target
        self.me = me
    def is_me(self):
        if self.me is not None and self.target == self.me:
            return True
