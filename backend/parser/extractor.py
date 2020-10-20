from parser.credentials import twitter_password, twitter_username
from bs4 import BeautifulSoup
from time import sleep
import re

class Extractor():
    """Extract text from a url"""
    def __init__(self, driver, max_length=1024, min_length=12, max_sequence_count=50):
        super().__init__()
        self.max_sequence_count = max_sequence_count
        self.max_length = max_length
        self.min_length = min_length
        self.driver = driver

    def extract_general(self, host, scroll_iterations=1):
        """
            Go to the host, scroll down scroll_iterations number of times and fetch
            the text of the page using __convert_html
        """
        self.driver.get(f"https:{host}")
        sleep(2)
        text = set()
        for _ in range(scroll_iterations):
            sleep(3)
            html = self.driver.page_source.encode("utf-8")
            text.update(self.__convert_html(html))
            self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        return text

    def extract_from_twitter(self, scroll_iterations=5):
        """
            Log in to twitter and scroll down scroll_iterations number of times,
            and fetch all text from the page using __convert_html
        """
        def _login_twitter(driver):
            username_field = self.driver.find_element_by_name("session[username_or_email]")
            password_field = self.driver.find_element_by_name("session[password]")
            username_field.send_keys(twitter_username)
            password_field.send_keys(twitter_password)
            self.driver.find_element_by_xpath("//*[@data-testid='LoginForm_Login_Button']").click()

        self.driver.get("https:twitter.com")
        sleep(2)
        _login_twitter(self.driver)
        text = set()
        for _ in range(scroll_iterations):
            sleep(3)
            html = self.driver.page_source.encode("utf-8")
            text.update(self.__convert_html(html))
            self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        return text

    def __convert_html(self, html):
        """
            Converts raw html into a list of text. 
            This is done by recusiverly fetching the children of each element, 
            starting from the body node, sorting them on text length and keep going until th
            max_sequence_count limit is reached
        """
        soup = BeautifulSoup(html, 'html.parser')
        body = soup.find('body')

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

        def _children(element):
            return [c for c in element.children if hasattr(c, 'text') and c.text != '' and c.name not in blacklist]

        within_allowed_node_count = True

        elements = _children(body)

        while within_allowed_node_count:
            # sort in reverse order
            elements = sorted(elements, key=lambda x: len(x.text), reverse=True)

            # keep track of changes made, in case we are never able to fill up the max_sequence_count
            changes_made_this_iteration = False

            # loop through nodes in reverse order
            # as long as we're not past the limit, replace each node with its children
            for element in reversed(elements):
                children = _children(element)
                if len(elements) + len(children) > self.max_sequence_count:
                    within_allowed_node_count = False
                    break
                elif len(children) > 0:
                    elements.remove(element)
                    elements.extend(children)
                    changes_made_this_iteration = True

            # If no changes are made in a whole pass means we only have leaf nodes
            # and should break to prevent an infinite loop
            if not changes_made_this_iteration:
                break

        text = [re.sub("\s\s+" , " ", e.get_text(separator=' ')) for e in elements if e.text != '']
        return [t for t in text if len(t) > self.min_length and len(t) < self.max_length]