from time import sleep
from selenium import webdriver
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.options import Options

from parser.credentials import twitter_username
from parser.credentials import twitter_password

from bs4 import BeautifulSoup

import re

max_length = 1024
min_length = 5
regex = re.compile('[A-Za-z]')


def setup_driver():
    options = Options()
    # options.add_argument("--disable-extensions")
    # options.add_argument("--window-size=720x480")
    # options.add_argument("--use-fake-ui-for-media-stream")
    # options.add_argument("--headless")
    driver = webdriver.Chrome(ChromeDriverManager().install(), options=options)
    return driver

def parse(host):
    driver = setup_driver()
    text = set([])
    if host=="twitter.com":
        text = extract_from_twitter(driver)
    else:
        text = extract_general(driver, host)

    return [str(s) for s in text if regex.match(str(s)) and len(str(s)) >= min_length and len(str(s)) <= max_length]

def extract_general(driver, host, scroll_iterations=1):
    driver.get(f"https:{host}")
    sleep(2)
    text = set()
    for _ in range(scroll_iterations):
        sleep(5)
        html = driver.page_source.encode("utf-8")
        text.update(extract_text_from(html))
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
    return text

def extract_from_twitter(driver, scroll_iterations=1):
    def _login_twitter(driver):
        username_field = driver.find_element_by_name("session[username_or_email]")
        password_field = driver.find_element_by_name("session[password]")
        username_field.send_keys(twitter_username)
        password_field.send_keys(twitter_password)
        driver.find_element_by_xpath("//*[@data-testid='LoginForm_Login_Button']").click()

    driver.get("https:twitter.com/klingfjord")
    sleep(2)
    #_login_twitter(driver)
    text = set()
    for _ in range(scroll_iterations):
        sleep(5)
        html = driver.page_source.encode("utf-8")
        text.update(extract_text_from(html))
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
    return text

    

def extract_text_from(html): 
    soup = BeautifulSoup(html, 'html.parser')
    text = soup.find_all(text=True)

    output = ''
    blacklist = [
        '[document]',
        'noscript',
        'header',
        'html',
        'meta',
        'head', 
        'input',
        'script',
        'style'
        # there may be more elements you don't want, such as "style", etc.
    ]
    return [t for t in text if t.parent.name not in blacklist]


def main():
    driver = setup_driver()
    extract_from_twitter(driver)
    sleep(200)
    print("Finished")

if __name__ == "__main__":
    main()    
