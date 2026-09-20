import sys
import os
import subprocess
import webbrowser
import time

def free_port(port=8000):
    """Frees target port if occupied by a previous server instance."""
    try:
        cmd = f"netstat -ano | findstr :{port}"
        output = subprocess.check_output(cmd, shell=True, text=True)
        for line in output.strip().split("\n"):
            if "LISTENING" in line:
                pid = line.strip().split()[-1]
                if pid and int(pid) != os.getpid():
                    print(f" -> Cleaning up existing process (PID {pid}) on port {port}...")
                    subprocess.call(f"taskkill /F /PID {pid}", shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    except Exception:
        pass

def main():
    print("=" * 65)
    print(" CryptoGuard - AI-Powered Bitcoin Monitoring & Investigation System")
    print("=" * 65)
    
    # Path setup
    project_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(project_dir, "backend")
    
    if backend_dir not in sys.path:
        sys.path.insert(0, backend_dir)
    os.chdir(backend_dir)
    
    print("\n[1/3] Verifying backend dependencies...")
    try:
        import fastapi
        import uvicorn
        import networkx
        import sklearn
        import numpy
        import pandas
        print(" -> All required Python libraries verified.")
    except ImportError as e:
        print(f" -> Missing library: {e}. Installing backend requirements...")
        py_bin = sys.executable
        subprocess.check_call([py_bin, "-m", "pip", "install", "-r", "requirements.txt"])

    free_port(8000)

    print("\n[2/3] Starting FastAPI backend server at http://127.0.0.1:8000 ...")
    
    # Open browser automatically after 2 seconds
    def open_browser():
        time.sleep(2)
        print("\n[3/3] Opening Investigator Dashboard in Web Browser...")
        webbrowser.open("http://127.0.0.1:8000")

    import threading
    threading.Thread(target=open_browser, daemon=True).start()

    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=False)

if __name__ == "__main__":
    main()
