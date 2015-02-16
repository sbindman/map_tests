import random

from flask import Flask, request, render_template, jsonify

app = Flask(__name__)



@app.route('/map')
def index():
    """Show our index page."""
    return render_template("click_return_elevation.html")




if __name__ == "__main__":
    app.run(debug=True)