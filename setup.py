from setuptools import setup, find_packages

setup(
    name="cluade-beatbot",
    version="0.1.0",
    description="A simple drum pattern generator and sequencer",
    author="sirm-cloud",
    packages=find_packages(),
    install_requires=[
        "numpy>=1.24.0",
    ],
    entry_points={
        "console_scripts": [
            "beatbot=beatbot.cli:main",
        ],
    },
    python_requires=">=3.8",
)
