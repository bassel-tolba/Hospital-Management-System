import os
import shutil

def get_file_structure_and_content(root_dir, file_extensions):
    """
    Recursively traverses a directory, reads file contents, and returns
    a formatted string with directory structure and file contents,
    optionally filtering by file extensions.

    Args:
        root_dir: The path to the root directory to traverse.
        file_extensions: A list of file extensions to include (e.g., ['.java', '.py']) or 'all' to include all.

    Returns:
        A string representing the directory structure and file content.
    """

    output = ""
    for item in os.listdir(root_dir):
        item_path = os.path.join(root_dir, item)

        if os.path.isdir(item_path):
            output += f"│   └── {item}\n"  # Directory representation with indentation
            output += get_file_structure_and_content(item_path, file_extensions)

        elif os.path.isfile(item_path):
            _, file_extension = os.path.splitext(item)  # get extension of file
            if file_extensions == 'all' or file_extension.lower() in [ext.lower() for ext in file_extensions]:
                try:
                  with open(item_path, 'r', encoding='utf-8') as file:  # utf-8 will handle most cases
                    file_content = file.read()
                    output += f"│   ├── {item}:```\n{file_content}\n```\n"
                except UnicodeDecodeError:
                   output += f"│   ├── {item}:```\n(Binary file - content not displayed)\n```\n"
                except Exception as e:
                    output += f"│   ├── {item}:```\nError reading file: {e}\n```\n"

    return output

if __name__ == "__main__":
    target_directory = input("Enter the directory path you want to analyze: ")
    output_file = input("Enter the name of the file to save the output: ")
    file_extensions_input = input("Enter file extensions to include (comma-separated, e.g., .java,.py) or type 'all' for all files: ")

    if not os.path.isdir(target_directory):
         print("The path provided is not a folder")
    else:
        if file_extensions_input.lower() == 'all':
             file_extensions = 'all'
        else:
             file_extensions = [ext.strip() for ext in file_extensions_input.split(',')] # Split into a list of extensions

        output_string = get_file_structure_and_content(target_directory, file_extensions)

        with open(output_file, 'w', encoding='utf-8') as f:
             f.write(target_directory + '\n')
             f.write(output_string)

        print(f"File structure and content saved to: {output_file}")
