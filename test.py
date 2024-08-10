from unittest import TestCase
from app import app
from flask import session
from boggle import Boggle

app.config['TESTING'] = True

class FlaskTests(TestCase):

    def test_homepage(self):
        """Test information in the session and HTML are displayed"""

        with app.test_client() as client:
            res = client.get("/")
            
            # Session test
            self.assertIn('board', session)
            self.assertIsNone(session.get('highscore'))
            self.assertIsNone(session.get('nplays'))

            # HTML test (must use b for byte eval)
            self.assertIn(b'<p>High Score:', res.data)
            self.assertIn(b'Score:', res.data)
            self.assertIn(b'Seconds Left:', res.data)

    def test_valid_word(self):
        """Test if word is valid by modifying the board in the session"""

        with app.test_client() as client:
            with client.session_transaction() as sess:
                sess['board'] = [
                    ["C", "A", "T", "T", "T"],
                    ["C", "A", "T", "T", "T"],
                    ["C", "A", "T", "T", "T"],
                    ["C", "A", "T", "T", "T"],
                    ["C", "A", "T", "T", "T"]
                ]

            # query the word cat in check-word route
            res = client.get('/check-word?word=cat')
            self.assertEqual(res.json['result'], 'ok')

    def test_invalid_word(self):
        """Test if word is in the dictionary"""

        with app.test_client() as client:
            client.get('/')

        res = client.get('/check-word?word=between')
        self.assertEqual(res.json['result'], 'not-on-board')

    def test_not_a_word(self):
        """Test if word is on the board"""

        with app.test_client() as client:
                    client.get('/')

        res = client.get('/check-word?word=aoijenpos')
        self.assertEqual(res.json['result'], 'not-word')