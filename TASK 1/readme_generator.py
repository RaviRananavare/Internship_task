def get_required_input(prompt):
    while True:
        value = input(prompt).strip()

        if value:
            return value

        print("This field cannot be empty. Please try again.")


def get_project_details():
    project_name = get_required_input("Enter project name: ")
    description = get_required_input("Enter project description: ")
    installation = get_required_input("Enter installation steps: ")
    usage = get_required_input("Enter usage examples: ")

    return project_name, description, installation, usage


def generate_readme(project_name, description, installation, usage):
    readme_content = f"""# {project_name}

## Description

{description}

## Installation

{installation}

## Usage

{usage}
"""

    return readme_content


def main():
    details = get_project_details()

    readme_content = generate_readme(*details)

    with open("README.md", "w", encoding="utf-8") as file:
        file.write(readme_content)

    print("README.md generated successfully!")


if __name__ == "__main__":
    main()
    