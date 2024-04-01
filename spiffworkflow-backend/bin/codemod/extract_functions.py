# extract_functions.py

import ast
import sys


def extract_function_body(filename, function_name):
    file_lines = None
    with open(filename, "r") as file:
        file_lines = file.read()
        tree = ast.parse(file_lines, filename=filename)
        # file_lines = file.readlines()
        # # convert file_lines to string
        # file_lines = "".join(file_lines)

    # Dictionary to store function bodies
    function_bodies = {}

    # Find the target function and its dependencies
    for node in ast.walk(tree):
        if isinstance(node, ast.FunctionDef):
            if node.name == function_name:
                function_bodies[node.name] = ast.get_source_segment(file_lines, node)

                # Extract dependencies
                # for n in ast.walk(node):
                #     if isinstance(n, ast.Call):
                #         function_bodies[n.func.id] = extract_function_body(filename, n.func.id)

    return function_bodies


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python extract_functions.py <filename> <function_name>")
        sys.exit(1)

    filename = sys.argv[1]
    function_name = sys.argv[2]
    function_bodies = extract_function_body(filename, function_name)
    for func_name, func_body in function_bodies.items():
        print(f"Function: {func_name}")
        print(func_body)
        print()
