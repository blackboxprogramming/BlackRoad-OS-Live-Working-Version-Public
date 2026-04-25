from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

setup(
    name="blackroad-pixel-city",
    version="2.0.0",
    author="BlackRoad OS",
    author_email="contact@blackroad.io",
    description="A vibrant pixel-art Pokemon-themed city simulator",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/blackroad-os/blackroad-pixel-city",
    packages=find_packages(),
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: End Users/Desktop",
        "Topic :: Games/Entertainment :: Simulation",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
    ],
    python_requires=">=3.8",
    install_requires=[
        "pygame>=2.0.0",
    ],
    entry_points={
        "console_scripts": [
            "pixel-city=src.pixel_city:main",
        ],
    },
)
