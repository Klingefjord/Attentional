import re
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager

from parser.extractor import Extractor

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
        text = Extractor(driver).extract_from_twitter()
    else:
        text = Extractor(driver).extract_general(host)

    driver.close()
    driver.quit()
    return [(str(s)) for s in text if regex.match(str(s))]

# # For testing purposes
# def main():
#     def _login_twitter(driver):
#         username_field = driver.find_element_by_name("session[username_or_email]")
#         password_field = driver.find_element_by_name("session[password]")
#         username_field.send_keys(twitter_username)
#         password_field.send_keys(twitter_password)
#         driver.find_element_by_xpath("//*[@data-testid='LoginForm_Login_Button']").click()

#     driver = setup_driver()
#     driver.get("https:twitter.com")
#     sleep(1)
#     _login_twitter(driver)
#     sleep(5)
#     text = set()
#     for _ in range(5):
#         sleep(2)
#         html = driver.page_source.encode("utf-8")
#         text.update(extract_text_recursively_from(html))
#         driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
#     [print(str(s) + "\n =================== \n") for s in text if regex.match(str(s)) and len(str(s)) >= min_length and len(str(s)) <= max_length]

# if __name__ == "__main__":
#     main()