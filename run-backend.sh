#!/bin/zsh
export PYTHONPATH=.
uvicorn app.backend.main:app --reload