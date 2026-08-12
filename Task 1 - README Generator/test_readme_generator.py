import unittest
from unittest.mock import patch
from readme_generator import generate_readme


class TestReadmeGenerator(unittest.TestCase):

    def test_basic_generation(self):
        result = generate_readme(
            "My Project",
            "A test project",
            "pip install pandas",
            "python app.py"
        )

        self.assertIn("# My Project", result)

    def test_description(self):
        result = generate_readme(
            "Test Project",
            "This is my description",
            "pip install numpy",
            "python main.py"
        )

        self.assertIn("This is my description", result)

    def test_installation_and_usage(self):
        result = generate_readme(
            "Demo Project",
            "A demo project",
            "pip install requests",
            "python demo.py"
        )

        self.assertIn("pip install requests", result)
        self.assertIn("python demo.py", result)

    @patch("builtins.input", side_effect=["   ", "Valid Project"])
    def test_empty_input_validation(self, mock_input):
        from readme_generator import get_required_input

        result = get_required_input("Enter project name: ")

        self.assertEqual(result, "Valid Project")


if __name__ == "__main__":
    unittest.main()