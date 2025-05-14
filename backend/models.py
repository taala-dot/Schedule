from dataclasses import dataclass
from typing import List, Set
from datetime import time

@dataclass
class Subject:
    name: str
    hours_per_week: int

@dataclass
class Teacher:
    name: str
    subjects: List[Subject]
    available_slots: Set[str]  # Format: "MONDAY_1", "TUESDAY_2", etc.
    preferences: List[str]  # Preferred slots

@dataclass
class Class:
    name: str  # e.g., "8A"
    subjects: List[Subject]

@dataclass
class Slot:
    day: str  # MONDAY, TUESDAY, etc.
    number: int  # Lesson number (1-8)

@dataclass
class Schedule:
    teacher_schedules: dict  # Teacher -> List[Slot]
    class_schedules: dict    # Class -> List[Slot]
    subject_schedules: dict  # Subject -> List[Slot]

# Constants
DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"]
LESSONS_PER_DAY = 8

def create_slot_key(day: str, number: int) -> str:
    return f"{day}_{number}" 