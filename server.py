browser_data_path = "/home/joe/.mozilla/firefox/joaoy09x.default-release/" + "places.sqlite"
lucky_url = "https://duckduckgo.com/?q=\\"  

import atexit
import sqlite3
from selenium import webdriver
from flask import Flask, render_template, Response, request, jsonify
from flask_cors import CORS

options = webdriver.ChromeOptions()
options.add_argument('--headless')
driver = webdriver.Chrome(options=options)

query_get_bookmarks = "SELECT moz_bookmarks.title, moz_places.url FROM moz_bookmarks JOIN moz_places ON moz_bookmarks.fk = moz_places.id"
connection = sqlite3.connect(browser_data_path)
cursor = connection.cursor()
cursor.execute(query_get_bookmarks)
bookmark_urls = cursor.fetchall()

app = Flask(__name__)
CORS(app)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/bookmarks')
def bookmarks():
    return jsonify(bookmark_urls)

@app.route('/lucky', methods=['POST'])
def lucky():
    query = str(request.json)
    url = lucky_url + query
    driver.get(url)
    result_url = driver.current_url
    return result_url, 200;

def exit():
    driver.quit()
    connection.close()
atexit.register(exit)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
