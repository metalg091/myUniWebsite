import os
import sys
import shutil
import re
import subprocess
import concurrent.futures
from typing import Callable
from typing_extensions import List

def remove_whitespace_and_empty_lines(content: str) -> str:
    """
    Removes leading and trailing whitespace from each line and removes empty lines.
    """
    return "\n".join(line.strip() for line in content.splitlines() if line.strip())

def remove_html_comment(content: str) -> str:
    """
    Removes html comments:
    """
    new_content: str = re.sub("(?=<!--)([\\s\\S]*?)-->", "", content)
    non_script: List[str] = re.split("(?=<script[^>]*>)[\\s\\S]*?<\\/script>", new_content)
    script: List[str] = re.findall("((?=<script[^>]*>)[\\s\\S]*?<\\/script>)", new_content)
    script = [remove_c_style_comment(s) for s in script]
    result: List[str] = []
    for i in range(len(non_script)):
        result.append(non_script[i])
        if i < len(script):
            result.append(script[i])
    return "".join(result).strip()

def remove_c_style_comment(content: str) -> str:
    """
    Removes c style comments handling:
    - Block comments: /* ... */
    - Inline comments: //
    - Strings with nested quotes like 'word"word"word'
    """
    in_block_comment = False
    in_string = None  # Tracks whether we're inside a string and with which quote (' or ")
    new_content = []
    i = 0

    while i < len(content):
        if in_block_comment:
            if content[i:i+2] == "*/":
                in_block_comment = False
                i += 1  # Skip closing */
            i += 1
            continue

        if content[i] in ('"', "'", "`"):
            if in_string is None:
                in_string = content[i]  # Entering a string
            elif in_string == content[i] and content[i-1] != "\\":
                in_string = None  # Exiting the string
            new_content.append(content[i])
        elif not in_string:
            if content[i:i+2] == "/*":  # Block comment start
                in_block_comment = True
                i += 1
            elif content[i:i+2] == "//":  # Single-line comment
                while i < len(content) and content[i] != "\n":  # Skip until newline
                    i += 1
            else:
                new_content.append(content[i])
        else:
            new_content.append(content[i])

        i += 1

    return "".join(new_content).strip()

def proc_file(source_file : str, dest_file : str, strip_style: Callable[[str], str]) -> None:
    """
    Processes a single file
    """
    with open(source_file, "r", encoding="utf-8") as f:
        content = f.read()

    content = remove_whitespace_and_empty_lines(strip_style(content))

    # Skip empty files
    if not content:
        return

    # if dest_file exists, and its content is the same as the new content, skip writing
    if os.path.exists(dest_file):
        with open(dest_file, "r", encoding="utf-8") as f:
            if f.read() == content:
                return

    with open(dest_file, "w", encoding="utf-8") as f:
        f.write(content)

def compute_file_hash(file_path: str) -> str:
    """
    Computes the sha1 hash of a file using the sha1sum command.
    """
    result = subprocess.run(['sha1sum', file_path], stdout=subprocess.PIPE, text=True)
    return result.stdout.split()[0]

def process_dir(source_dir: str, target_dir: str) -> None:
    """
    Processes all .js and .css files in a directory while keeping others unchanged.
    """
    if not os.path.exists(target_dir):
        os.makedirs(target_dir, exist_ok=True)
    else:
        # Clear the target directory
        # shutil.rmtree(target_dir)
        pass

    c_style = remove_c_style_comment
    html_style = remove_html_comment

    # Remove files in target_dir that are not in source_dir
    source_file_list = set()
    pool = concurrent.futures.ThreadPoolExecutor(max_workers=1) # Bruh it's faster with 1 worker

    for root, dirs, files in os.walk(source_dir):
        for file in files + dirs:
            source_file = os.path.join(root, file)
            rel_path = os.path.relpath(source_file, source_dir)
            dest_file = os.path.join(target_dir, rel_path)
            # Store the relative path of the file
            source_file_list.add(rel_path)
            if os.path.isdir(source_file):
                os.makedirs(os.path.dirname(dest_file), exist_ok=True)
            else:
                os.makedirs(os.path.dirname(dest_file), exist_ok=True)
                if file.endswith((".js", ".css")):
                    pool.submit(proc_file, source_file, dest_file, c_style)
                    #proc_file(source_file, dest_file, c_style)
                elif file.endswith((".html" ,".htm")):
                    pool.submit(proc_file, source_file, dest_file, html_style)
                    #proc_file(source_file, dest_file, html_style)
                else:
                    if (not os.path.exists(dest_file) or (os.path.getmtime(source_file) > os.path.getmtime(dest_file))): # Copy only if the files are different
                        pool.submit(shutil.copy2, source_file, dest_file)  # Copy non-code files unchanged
                        #shutil.copy2(source_file, dest_file)  # Copy non-code files unchanged

    # Remove files in target_dir that are not in source_dir
    for root, dirs, files in os.walk(target_dir):
            for file in files + dirs:
                rel_path = os.path.relpath(os.path.join(root, file), target_dir)
                if rel_path not in source_file_list:
                    file_path = os.path.join(target_dir, rel_path)
                    if os.path.isfile(file_path):
                        pool.submit(os.remove, file_path)
                        #os.remove(file_path)
                        print(f"Removed file: {file_path}")
                    elif os.path.isdir(file_path):
                        pool.submit(shutil.rmtree, file_path)
                        #shutil.rmtree(file_path)
                        print(f"Removed directory: {file_path}")
    pool.shutdown(wait=True)

if __name__ == "__main__":
    if len(sys.argv) == 2:
        pass
    elif len(sys.argv) != 3:
        print("Usage: python strip-comments.py <source_file or dir> <target_file or dir>")
        sys.exit(1)

    source = sys.argv[1]
    if(len(sys.argv)) == 3:
        target = sys.argv[2]
    else:
        target = "strip-" + source

    c_style = remove_c_style_comment
    html_style = remove_html_comment

    if(os.path.isdir(source) and (os.path.isdir(target) or not os.path.exists(target))):
        process_dir(source, target)
    elif(os.path.isfile(source) and (os.path.isfile(target) or not os.path.exists(target))):
        if source.endswith((".js", ".css")):
            proc_file(source, target, c_style)
        elif source.endswith((".html" ,".htm")):
            proc_file(source, target, html_style)
        else:
            shutil.copy2(source, target)  # Copy non-code files unchanged
    else:
        print("source and target type should be the same!")
