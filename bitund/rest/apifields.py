from flask_restful import fields


#############################USERS###############################
userlist_fields = {
    'username':fields.String,
    'email':fields.String,
    # 'password':fields.String
    'uri':fields.Url
}

user_fields = {
    'id':fields.Integer,
    'username':fields.String,
    'password':fields.String,
    'email':fields.String,
    'uri':fields.Url,
    'created_at':fields.DateTime
}
