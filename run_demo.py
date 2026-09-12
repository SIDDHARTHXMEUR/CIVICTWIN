import os
import subprocess
import sys


def main():
    print("=" * 60)
    print("   CIVICTWIN — AI URBAN INTELLIGENCE LAYER (NIT DELHI)")
    print("=" * 60)

    base_dir = os.path.dirname(os.path.abspath(__file__))
    api_dir = os.path.join(base_dir, "services", "api")

    # Step 1: Run Seed Script to populate DB
    seed_script = os.path.join(base_dir, "infra", "seed_data", "seed.py")
    print("\n[1/3] Seeding NIT Delhi initial infrastructure & incident reports...")
    try:
        subprocess.run([sys.executable, seed_script], check=True)
    except Exception as e:
        print(f"Warning during seed: {e}")

    # Step 2: Print links & instructions
    print("\n[2/3] CivicTwin Core Stack Prepared!")
    print("  • FastAPI Engine:       http://localhost:8000")
    print("  • OpenAPI Specs:        http://localhost:8000/docs")
    print("  • Citizen Mobile PWA:   http://localhost:3000")
    print("  • Authority Dashboard:  http://localhost:5173")

    print("\n[3/3] Starting FastAPI Engine server...")
    os.chdir(api_dir)
    subprocess.run([sys.executable, "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"])

if __name__ == "__main__":
    main()
