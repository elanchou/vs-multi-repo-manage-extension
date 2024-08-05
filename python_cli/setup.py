from setuptools import setup, find_packages

with open("README.md", "r") as fh:
    long_description = fh.read()

setup(
    name="agit",
    version="0.1",
    author="Elan",
    author_email="zhouguanyang.zgy@antgroup.com",
    description="A command-line tool to switch all Git repos in a directory to the same branch",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/elanchou/agit",
    packages=find_packages(),
    entry_points={
        "console_scripts": [
            "agit=agit:main",
        ],
    },
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
    python_requires='>=3.6',
)