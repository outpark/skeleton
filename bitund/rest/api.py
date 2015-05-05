# -*- coding: utf-8 -*-
'''Public section, including homepage and signup.'''
from flask import (Blueprint, request, abort, render_template, url_for, jsonify, g)
from flask_restful import Resource, reqparse, fields, marshal

from bitund.extensions import auth, api
from bitund.models import User
from bitund.database import db


from .utils import *
from .apifields import *

from datetime import datetime
import types



mod = Blueprint('rest', __name__, static_folder="../static")


#only receives the following headers
@mod.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
    return response

##########################################################################

#every path leads to index.html
@mod.route('/')
@mod.route('/<path:p>')
def home(*args, **kwargs):
    return render_template('index.html')




@api.resource('/api/token', endpoint='token')
class TokenAPI(Resource):
    decorators = [auth.login_required]
    def get(self):
        return {'username':g.user.username}
    def post(self):
        token = g.user.generate_auth_token()
        return {'status':'0','token': token.decode('ascii'),'username':g.user.username}
    


#######################################users###############################


@api.resource('/api/users', endpoint='users')
class UserListAPI(Resource):
    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('username', type=str, required=True, help='No Name Provided', location='json')
        self.reqparse.add_argument('email', type=str, required=True, help='No Email Provided', location='json')
        self.reqparse.add_argument('password',type=str, required=True, help='No Password Provided', location="json")
        super(UserListAPI, self).__init__()
    def get(self):
        users = User.query.all()
        return marshal(users, userlist_fields)
    def post(self):
        args = self.reqparse.parse_args()
        user = User.create(username=args.username,
                            email=args.email,
                            password=args.password)
        return {"created":user.username}, 201



@api.resource('/api/users/<int:id>', endpoint='user')
class UserAPI(Resource):
    decorators = [auth.login_required]
    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('username', type=str, help='No Name Provided', location='json')
        self.reqparse.add_argument('email', type=str, help='No Email Provided', location='json')
        self.reqparse.add_argument('password',type=str, help='No Password Provided', location="json")
        super(UserAPI, self).__init__()
    def get(self,id):
        user = User.query.get(id)
        self.check = Check(id, g.user.id)
        if self.check.is_me():
            return marshal(user, user_fields)
        else:
            abort(400)
    def put(self,id):
        self.check = Check(id, g.user.id)
        if self.check.is_me():
            user = User.query.get(id)
            args = self.reqparse.parse_args()
            user.update(email=args.email)
            return {'status':'0'}
        else:
            abort(400)
        
    def delete(self,id):
        user = User.query.get(id)
        # while is_me(user.id, g.user.id):
            # abort(404)
        user.delete()
        return {'status':'0'}


