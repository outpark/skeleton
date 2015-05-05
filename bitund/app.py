# -*- coding: utf-8 -*-
'''The app module, containing the app factory function.'''
from flask import Flask, render_template

from bitund.settings import ProdConfig
from bitund.assets import assets
from bitund.extensions import (
    bcrypt,
    cache,
    db,
    migrate,
    debug_toolbar,
    api,
)
from bitund import rest


def create_app(config_object=ProdConfig):
    '''An application factory, as explained here:
        http://flask.pocoo.org/docs/patterns/appfactories/

    :param config_object: The configuration object to use.
    '''
    app = Flask(__name__)
    app.config.from_object(config_object)
    register_extensions(app)
    register_blueprints(app)
    return app


def register_extensions(app):
    assets.init_app(app)
    bcrypt.init_app(app)
    cache.init_app(app)
    db.init_app(app)
    debug_toolbar.init_app(app)
    migrate.init_app(app, db)
    api.init_app(app)
    return None


def register_blueprints(app):
    app.register_blueprint(rest.api.mod)
    return None

