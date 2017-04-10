from flask import flash


def set_template(prefix, name, ext=".html"):
    """
    This will return a safe template file path based on  given params
    :param prefix: template root for module
    :param name: template name 
    :param ext: template extension
    :return: formatted for flask
    """
    return prefix + "/" + name + ext


def set_message(message, message_type):
    msg = '<div class="container flash-message flash-message-{0}">{1}</div>'.format(message_type, message)
    return flash(msg)
