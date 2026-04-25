"""
Meeting Scheduler Agent

Intelligently schedules meetings by analyzing calendars, preferences,
time zones, and availability to find optimal meeting times.
"""

from typing import Any, Dict, List
from agents.base import BaseAgent


class MeetingSchedulerAgent(BaseAgent):
    """
    Intelligently schedules meetings and manages calendars.

    Features:
    - Availability analysis
    - Time zone coordination
    - Meeting optimization
    - Calendar integration
    - Automated reminders
    - Conflict resolution
    """

    def __init__(self):
        super().__init__(
            name='meeting-scheduler',
            description='Schedule meetings intelligently across calendars and time zones',
            category='business',
            version='1.0.0',
            tags=['scheduling', 'calendar', 'meetings', 'coordination', 'automation']
        )

    async def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Schedule meetings intelligently.

        Args:
            params: {
                'operation': 'schedule|reschedule|cancel|find_time|optimize',
                'participants': List[str],
                'duration_minutes': int,
                'meeting_type': 'internal|external|interview|review',
                'date_range': Dict,
                'options': {
                    'prefer_mornings': bool,
                    'require_all_participants': bool,
                    'allow_overlaps': bool,
                    'send_invites': bool,
                    'include_buffer': bool
                }
            }

        Returns:
            {
                'status': 'success|failed',
                'meeting': Dict,
                'suggested_times': List[Dict],
                'conflicts': List[Dict],
                'recommendations': List[str]
            }
        """
        operation = params.get('operation', 'schedule')
        participants = params.get('participants', [])
        duration = params.get('duration_minutes', 60)
        meeting_type = params.get('meeting_type', 'internal')
        options = params.get('options', {})

        self.logger.info(
            f"Meeting scheduling: {operation} for {len(participants)} participants"
        )

        # Mock participant availability
        participant_availability = [
            {
                'participant_id': 'EMP-123',
                'name': 'John Smith',
                'email': 'john.smith@company.com',
                'timezone': 'America/New_York',
                'working_hours': '9:00-17:00',
                'available_slots': [
                    {'date': '2025-11-18', 'start': '10:00', 'end': '11:00'},
                    {'date': '2025-11-18', 'start': '14:00', 'end': '16:00'},
                    {'date': '2025-11-19', 'start': '09:00', 'end': '12:00'},
                    {'date': '2025-11-19', 'start': '15:00', 'end': '17:00'}
                ],
                'busy_slots': [
                    {'date': '2025-11-18', 'start': '09:00', 'end': '10:00', 'meeting': 'Team Standup'},
                    {'date': '2025-11-18', 'start': '11:00', 'end': '12:00', 'meeting': 'Client Call'}
                ],
                'preferences': {
                    'avoid_lunch_hours': True,
                    'prefer_mornings': True,
                    'max_meetings_per_day': 6
                }
            },
            {
                'participant_id': 'EMP-456',
                'name': 'Sarah Johnson',
                'email': 'sarah.j@company.com',
                'timezone': 'America/Los_Angeles',
                'working_hours': '9:00-17:00',
                'available_slots': [
                    {'date': '2025-11-18', 'start': '13:00', 'end': '17:00'},  # 10-2 PM ET
                    {'date': '2025-11-19', 'start': '09:00', 'end': '11:00'},  # 12-2 PM ET
                    {'date': '2025-11-19', 'start': '14:00', 'end': '17:00'}   # 5-8 PM ET
                ],
                'busy_slots': [
                    {'date': '2025-11-18', 'start': '09:00', 'end': '13:00', 'meeting': 'Deep Work Block'}
                ],
                'preferences': {
                    'avoid_lunch_hours': True,
                    'prefer_afternoons': True,
                    'max_meetings_per_day': 5
                }
            },
            {
                'participant_id': 'EXT-789',
                'name': 'Michael Chen',
                'email': 'mchen@client.com',
                'timezone': 'America/Chicago',
                'working_hours': '8:00-16:00',
                'available_slots': [
                    {'date': '2025-11-18', 'start': '10:00', 'end': '12:00'},
                    {'date': '2025-11-18', 'start': '14:00', 'end': '16:00'},
                    {'date': '2025-11-19', 'start': '08:00', 'end': '10:00'},
                    {'date': '2025-11-19', 'start': '13:00', 'end': '16:00'}
                ],
                'preferences': {
                    'avoid_lunch_hours': True,
                    'prefer_mornings': False
                }
            }
        ]

        # Mock suggested meeting times
        suggested_times = [
            {
                'rank': 1,
                'date': '2025-11-19',
                'start_time': '15:00',  # 3 PM ET
                'end_time': '16:00',
                'timezone': 'America/New_York',
                'score': 95,
                'all_participants_available': True,
                'conflicts': [],
                'time_zone_friendly': True,
                'preference_match': 'high',
                'converted_times': {
                    'EMP-123': '15:00 EST',
                    'EMP-456': '12:00 PST',
                    'EXT-789': '14:00 CST'
                },
                'reasoning': 'All participants available, within working hours, matches most preferences'
            },
            {
                'rank': 2,
                'date': '2025-11-18',
                'start_time': '14:00',
                'end_time': '15:00',
                'timezone': 'America/New_York',
                'score': 88,
                'all_participants_available': True,
                'conflicts': [],
                'time_zone_friendly': True,
                'preference_match': 'medium',
                'converted_times': {
                    'EMP-123': '14:00 EST',
                    'EMP-456': '11:00 PST',
                    'EXT-789': '13:00 CST'
                },
                'reasoning': 'All available, earlier date, but less preference match'
            },
            {
                'rank': 3,
                'date': '2025-11-19',
                'start_time': '10:00',
                'end_time': '11:00',
                'timezone': 'America/New_York',
                'score': 82,
                'all_participants_available': True,
                'conflicts': [],
                'time_zone_friendly': True,
                'preference_match': 'medium',
                'converted_times': {
                    'EMP-123': '10:00 EST',
                    'EMP-456': '07:00 PST',  # Early for Sarah
                    'EXT-789': '09:00 CST'
                },
                'reasoning': 'All available but very early for PST participant'
            }
        ]

        # Mock scheduled meeting
        scheduled_meeting = {
            'id': 'MTG-2025-001',
            'title': 'Project Status Review',
            'type': meeting_type,
            'date': '2025-11-19',
            'start_time': '15:00',
            'end_time': '16:00',
            'timezone': 'America/New_York',
            'duration_minutes': duration,
            'location': 'Virtual - Zoom',
            'organizer': {
                'id': 'EMP-123',
                'name': 'John Smith',
                'email': 'john.smith@company.com'
            },
            'participants': participant_availability,
            'status': 'confirmed',
            'meeting_link': 'https://zoom.us/j/123456789',
            'calendar_invites_sent': True,
            'reminders_scheduled': [
                {'type': 'email', 'time': '24_hours_before'},
                {'type': 'notification', 'time': '15_minutes_before'}
            ],
            'agenda': [
                'Project updates from each team member',
                'Blockers and risks discussion',
                'Next steps and action items'
            ],
            'preparation_required': [
                'Review project dashboard',
                'Prepare status update'
            ]
        }

        # Mock conflicts detected
        conflicts = [
            {
                'participant': 'EMP-234',
                'name': 'Emily Davis',
                'conflict_type': 'double_booking',
                'existing_meeting': 'Client Review',
                'time': '2025-11-18 14:00-15:00',
                'severity': 'high',
                'resolution': 'Suggested alternative time slot'
            },
            {
                'participant': 'EMP-456',
                'name': 'Sarah Johnson',
                'conflict_type': 'preference_violation',
                'issue': 'Meeting outside preferred hours',
                'time': '2025-11-19 10:00-11:00',
                'severity': 'low',
                'resolution': 'Accepted by participant'
            }
        ]

        # Mock scheduling analytics
        analytics = {
            'total_meetings_scheduled': 234,
            'meetings_this_week': 45,
            'average_scheduling_time_minutes': 3.2,
            'conflicts_resolved': 23,
            'rescheduled_meetings': 12,
            'cancelled_meetings': 5,
            'no_show_rate': 0.04,
            'average_meeting_duration': 47,
            'most_common_meeting_times': [
                '10:00 AM', '2:00 PM', '3:00 PM'
            ],
            'busiest_days': ['Tuesday', 'Wednesday', 'Thursday'],
            'average_participants_per_meeting': 3.8,
            'meeting_type_breakdown': {
                'internal': 145,
                'external': 56,
                'interview': 18,
                'review': 15
            }
        }

        # Mock calendar optimization suggestions
        optimization_suggestions = [
            {
                'type': 'consolidate_meetings',
                'description': 'Group 3 related meetings into single 90-min session',
                'potential_time_saved_minutes': 45,
                'affected_meetings': ['MTG-001', 'MTG-002', 'MTG-003']
            },
            {
                'type': 'shorten_duration',
                'description': '5 meetings scheduled for 60 min, could be 30 min',
                'potential_time_saved_minutes': 150,
                'affected_meetings': ['MTG-004', 'MTG-005', 'MTG-006']
            },
            {
                'type': 'add_buffer_time',
                'description': 'Add 15-min buffer between back-to-back meetings',
                'improvement': 'Reduced stress and better preparation'
            },
            {
                'type': 'focus_time_blocks',
                'description': 'Reserve 2-hour blocks for deep work',
                'suggested_times': ['Tuesday 9-11 AM', 'Thursday 2-4 PM']
            }
        ]

        return {
            'status': 'success',
            'operation': operation,
            'scheduled_meeting': scheduled_meeting,
            'suggested_times': suggested_times,
            'best_time': suggested_times[0] if suggested_times else None,
            'participant_availability': participant_availability,
            'conflicts': conflicts,
            'conflicts_resolved': len(conflicts),
            'analytics': analytics,
            'time_zone_summary': {
                'zones_involved': 3,
                'primary_zone': 'America/New_York',
                'challenging_combinations': [
                    'PST participants in early ET morning meetings'
                ],
                'optimal_windows': [
                    '11:00-15:00 ET (covers all zones reasonably)'
                ]
            },
            'calendar_health': {
                'meeting_load': 'moderate',
                'fragmentation_score': 6.5,  # 1-10, lower is better
                'focus_time_percentage': 0.42,
                'meeting_density_peak_hours': '10:00-15:00',
                'recommendation': 'Consider blocking focus time in mornings'
            },
            'optimization_suggestions': optimization_suggestions,
            'potential_time_savings_hours': 3.25,
            'recommendations': [
                'Best time: 2025-11-19 at 3:00 PM ET (score: 95)',
                'All participants available with minimal conflicts',
                'Consider adding 15-minute buffer before/after',
                'Send calendar invite at least 24 hours in advance',
                'Include Zoom link and agenda in invitation',
                'Set up automated reminders',
                'Review and consolidate similar meetings this week'
            ],
            'next_steps': [
                'Confirm selected time with all participants',
                'Send calendar invitations with meeting details',
                'Add video conference link',
                'Set up automated reminders',
                'Share agenda 24 hours before meeting',
                'Prepare meeting materials',
                'Follow up with participants who haven\'t responded'
            ]
        }

    def validate_params(self, params: Dict[str, Any]) -> bool:
        """Validate meeting scheduling parameters."""
        valid_operations = [
            'schedule', 'reschedule', 'cancel', 'find_time', 'optimize'
        ]
        valid_meeting_types = ['internal', 'external', 'interview', 'review']

        operation = params.get('operation')
        if operation and operation not in valid_operations:
            self.logger.error(f"Invalid operation: {operation}")
            return False

        meeting_type = params.get('meeting_type')
        if meeting_type and meeting_type not in valid_meeting_types:
            self.logger.error(f"Invalid meeting type: {meeting_type}")
            return False

        duration = params.get('duration_minutes')
        if duration and (duration < 15 or duration > 480):
            self.logger.error(f"Invalid duration: {duration}. Must be 15-480 minutes")
            return False

        return True
