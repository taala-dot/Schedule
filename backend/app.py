from flask import Flask, request, jsonify
from flask_cors import CORS
from .models import Teacher, Class, Subject, Slot
from .scheduler import Scheduler

app = Flask(__name__)
CORS(app)

scheduler = Scheduler()

@app.route('/api/teachers', methods=['POST'])
def add_teacher():
    data = request.json
    teacher = Teacher(
        name=data['name'],
        subjects=[Subject(**s) for s in data['subjects']],
        available_slots=set(data['available_slots']),
        preferences=data['preferences']
    )
    scheduler.add_teacher(teacher)
    return jsonify({"message": "Teacher added successfully"})

@app.route('/api/classes', methods=['POST'])
def add_class():
    data = request.json
    class_ = Class(
        name=data['name'],
        subjects=[Subject(**s) for s in data['subjects']]
    )
    scheduler.add_class(class_)
    return jsonify({"message": "Class added successfully"})

@app.route('/api/subjects', methods=['POST'])
def add_subject():
    data = request.json
    subject = Subject(**data)
    scheduler.add_subject(subject)
    return jsonify({"message": "Subject added successfully"})

@app.route('/api/schedule', methods=['POST'])
def generate_schedule():
    if scheduler.generate_schedule():
        # Convert schedule to JSON-friendly format
        schedule_data = {
            "teacher_schedules": {
                teacher.name: [
                    {"day": slot.day, "number": slot.number}
                    for slot in slots
                ]
                for teacher, slots in scheduler.schedule.teacher_schedules.items()
            },
            "class_schedules": {
                class_.name: [
                    {"day": slot.day, "number": slot.number}
                    for slot in slots
                ]
                for class_, slots in scheduler.schedule.class_schedules.items()
            },
            "score": scheduler.get_schedule_score()
        }
        return jsonify(schedule_data)
    return jsonify({"error": "Could not generate valid schedule"}), 400

if __name__ == '__main__':
    app.run(debug=True) 