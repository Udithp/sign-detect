import os
import zipfile

def zip_project(output_filename):
    # Folders to exclude
    exclude_dirs = {'venv', 'node_modules', '.git', '__pycache__', '.ipynb_checkpoints'}
    
    root_dir = os.getcwd()
    
    with zipfile.ZipFile(output_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(root_dir):
            # Modify dirs in-place to skip excluded directories
            dirs[:] = [d for d in dirs if d not in exclude_dirs]
            
            # Skip the output zip file itself if it's in the same directory
            if output_filename in files:
                files.remove(output_filename)

            for file in files:
                file_path = os.path.join(root, file)
                # Create a relative path for the file in the zip
                rel_path = os.path.relpath(file_path, root_dir)
                zipf.write(file_path, rel_path)
    
    return os.path.abspath(output_filename)

if __name__ == "__main__":
    zip_name = "SignLanguageApp_Shared.zip"
    path = zip_project(zip_name)
    print(f"Zip updated successfully at: {path}")
