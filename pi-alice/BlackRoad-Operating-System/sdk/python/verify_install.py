#!/usr/bin/env python3
"""
BlackRoad SDK Installation Verification Script
==============================================

This script verifies that the BlackRoad SDK is properly installed
and all components can be imported.
"""

import sys


def check_python_version():
    """Check if Python version is compatible."""
    print("Checking Python version...")
    if sys.version_info < (3, 8):
        print("  ❌ Python 3.8+ required")
        print(f"  Current version: {sys.version}")
        return False
    print(f"  ✓ Python {sys.version_info.major}.{sys.version_info.minor}")
    return True


def check_dependencies():
    """Check if required dependencies are installed."""
    print("\nChecking dependencies...")
    dependencies = {
        "httpx": "HTTP client library",
        "pydantic": "Data validation library",
        "dateutil": "Date/time utilities",
    }

    all_installed = True
    for package, description in dependencies.items():
        try:
            __import__(package)
            print(f"  ✓ {package} - {description}")
        except ImportError:
            print(f"  ❌ {package} - {description} (NOT INSTALLED)")
            all_installed = False

    return all_installed


def check_sdk_import():
    """Check if SDK can be imported."""
    print("\nChecking BlackRoad SDK import...")
    try:
        import blackroad

        print(f"  ✓ BlackRoad SDK v{blackroad.__version__}")
        return True
    except ImportError as e:
        print(f"  ❌ Failed to import BlackRoad SDK: {e}")
        return False


def check_components():
    """Check if all SDK components can be imported."""
    print("\nChecking SDK components...")

    components = {
        "Client": ("blackroad", "BlackRoadClient"),
        "Async Client": ("blackroad", "AsyncBlackRoadClient"),
        "Models": ("blackroad.models", ["User", "Wallet", "Transaction", "Block", "AgentInfo"]),
        "Exceptions": (
            "blackroad.exceptions",
            [
                "BlackRoadError",
                "AuthenticationError",
                "NotFoundError",
                "ValidationError",
                "BlockchainError",
            ],
        ),
        "Auth Client": ("blackroad.auth", "AuthClient"),
        "Blockchain Client": ("blackroad.blockchain", "BlockchainClient"),
        "Agents Client": ("blackroad.agents", "AgentsClient"),
    }

    all_ok = True
    for name, (module, items) in components.items():
        try:
            mod = __import__(module, fromlist=["*"])
            if isinstance(items, list):
                for item in items:
                    getattr(mod, item)
            else:
                getattr(mod, items)
            print(f"  ✓ {name}")
        except (ImportError, AttributeError) as e:
            print(f"  ❌ {name}: {e}")
            all_ok = False

    return all_ok


def check_examples():
    """Check if example files exist."""
    print("\nChecking examples...")
    import os

    examples_dir = os.path.join(os.path.dirname(__file__), "examples")
    examples = ["quickstart.py", "agents_example.py", "blockchain_example.py"]

    all_exist = True
    for example in examples:
        path = os.path.join(examples_dir, example)
        if os.path.exists(path):
            print(f"  ✓ {example}")
        else:
            print(f"  ❌ {example} (NOT FOUND)")
            all_exist = False

    return all_exist


def check_tests():
    """Check if test files exist."""
    print("\nChecking tests...")
    import os

    tests_dir = os.path.join(os.path.dirname(__file__), "tests")
    tests = ["test_client.py", "test_agents.py"]

    all_exist = True
    for test in tests:
        path = os.path.join(tests_dir, test)
        if os.path.exists(path):
            print(f"  ✓ {test}")
        else:
            print(f"  ❌ {test} (NOT FOUND)")
            all_exist = False

    return all_exist


def test_basic_functionality():
    """Test basic SDK functionality."""
    print("\nTesting basic functionality...")

    try:
        from blackroad import BlackRoadClient
        from blackroad.exceptions import ConfigurationError

        # Test client initialization (should fail without URL)
        try:
            import os

            # Temporarily clear environment
            old_url = os.environ.get("BLACKROAD_BASE_URL")
            if old_url:
                del os.environ["BLACKROAD_BASE_URL"]

            try:
                client = BlackRoadClient()
                print("  ❌ ConfigurationError should be raised without URL")
                return False
            except ConfigurationError:
                print("  ✓ ConfigurationError raised correctly")

            # Restore environment
            if old_url:
                os.environ["BLACKROAD_BASE_URL"] = old_url

        except Exception as e:
            print(f"  ❌ Configuration test failed: {e}")
            return False

        # Test client initialization with URL
        try:
            client = BlackRoadClient(base_url="http://localhost:8000")
            print("  ✓ Client initialization")
            client.close()
        except Exception as e:
            print(f"  ❌ Client initialization failed: {e}")
            return False

        # Test model creation
        try:
            from blackroad.models import UserCreate

            user_data = UserCreate(
                username="test", email="test@example.com", password="password123"
            )
            print("  ✓ Model validation")
        except Exception as e:
            print(f"  ❌ Model validation failed: {e}")
            return False

        print("  ✓ All basic functionality tests passed")
        return True

    except Exception as e:
        print(f"  ❌ Basic functionality test failed: {e}")
        return False


def main():
    """Run all verification checks."""
    print("=" * 60)
    print("BlackRoad SDK Installation Verification")
    print("=" * 60)

    checks = [
        ("Python Version", check_python_version),
        ("Dependencies", check_dependencies),
        ("SDK Import", check_sdk_import),
        ("Components", check_components),
        ("Examples", check_examples),
        ("Tests", check_tests),
        ("Basic Functionality", test_basic_functionality),
    ]

    results = []
    for name, check_func in checks:
        try:
            result = check_func()
            results.append((name, result))
        except Exception as e:
            print(f"\n❌ {name} check failed with exception: {e}")
            results.append((name, False))

    # Summary
    print("\n" + "=" * 60)
    print("Verification Summary")
    print("=" * 60)

    all_passed = True
    for name, result in results:
        status = "✓ PASS" if result else "❌ FAIL"
        print(f"{status:8} - {name}")
        if not result:
            all_passed = False

    print("=" * 60)

    if all_passed:
        print("\n🎉 All checks passed! BlackRoad SDK is properly installed.")
        print("\nNext steps:")
        print("  1. Start the BlackRoad backend server")
        print("  2. Run the examples: python examples/quickstart.py")
        print("  3. Run the tests: pytest")
        return 0
    else:
        print("\n⚠️  Some checks failed. Please review the output above.")
        print("\nTroubleshooting:")
        print("  1. Make sure you installed the SDK: pip install -e .")
        print("  2. Check your Python version: python --version")
        print("  3. Install dependencies: pip install -r requirements.txt")
        return 1


if __name__ == "__main__":
    sys.exit(main())
