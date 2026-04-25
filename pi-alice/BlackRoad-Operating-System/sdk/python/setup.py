"""Setup configuration for BlackRoad Python SDK."""

from setuptools import setup, find_packages
from pathlib import Path

# Read the README file
readme_file = Path(__file__).parent / "README.md"
long_description = readme_file.read_text(encoding="utf-8") if readme_file.exists() else ""

# Read requirements
requirements_file = Path(__file__).parent / "requirements.txt"
if requirements_file.exists():
    requirements = [
        line.strip()
        for line in requirements_file.read_text(encoding="utf-8").splitlines()
        if line.strip() and not line.startswith("#")
    ]
else:
    requirements = [
        "httpx>=0.24.0",
        "pydantic>=2.0.0",
        "python-dateutil>=2.8.0",
        "typing-extensions>=4.0.0",
    ]

dev_requirements = [
    "pytest>=7.0.0",
    "pytest-asyncio>=0.21.0",
    "pytest-cov>=4.0.0",
    "black>=23.0.0",
    "flake8>=6.0.0",
    "mypy>=1.0.0",
    "pylint>=2.17.0",
    "isort>=5.12.0",
]

setup(
    name="blackroad",
    version="0.1.0",
    author="BlackRoad Team",
    author_email="support@blackroad.dev",
    description="Official Python SDK for the BlackRoad Operating System",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/blackboxprogramming/BlackRoad-Operating-System",
    project_urls={
        "Bug Tracker": "https://github.com/blackboxprogramming/BlackRoad-Operating-System/issues",
        "Documentation": "https://blackroad.dev/docs",
        "Source Code": "https://github.com/blackboxprogramming/BlackRoad-Operating-System",
    },
    packages=find_packages(exclude=["tests", "examples"]),
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
        "Topic :: Software Development :: Libraries :: Python Modules",
        "Topic :: Internet :: WWW/HTTP",
        "Typing :: Typed",
    ],
    python_requires=">=3.8",
    install_requires=requirements,
    extras_require={
        "dev": dev_requirements,
        "test": [
            "pytest>=7.0.0",
            "pytest-asyncio>=0.21.0",
            "pytest-cov>=4.0.0",
        ],
    },
    include_package_data=True,
    zip_safe=False,
    keywords=[
        "blackroad",
        "ai",
        "agents",
        "blockchain",
        "roadchain",
        "api",
        "sdk",
        "async",
    ],
)
