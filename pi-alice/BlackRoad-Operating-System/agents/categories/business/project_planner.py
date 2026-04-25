"""
Project Planner Agent

Plans and tracks projects including task management, resource allocation,
timeline planning, and progress monitoring.
"""

from typing import Any, Dict, List
from agents.base import BaseAgent


class ProjectPlannerAgent(BaseAgent):
    """
    Plans and manages projects and tasks.

    Features:
    - Project planning
    - Task management
    - Resource allocation
    - Timeline tracking
    - Milestone management
    - Risk assessment
    """

    def __init__(self):
        super().__init__(
            name='project-planner',
            description='Plan and track projects with tasks and milestones',
            category='business',
            version='1.0.0',
            tags=['project-management', 'planning', 'tasks', 'tracking', 'collaboration']
        )

    async def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Plan and track projects.

        Args:
            params: {
                'operation': 'create|update|track|allocate|forecast',
                'project_id': str,
                'timeline': Dict,
                'resources': List[str],
                'options': {
                    'auto_assign_tasks': bool,
                    'track_dependencies': bool,
                    'calculate_critical_path': bool,
                    'send_updates': bool
                }
            }

        Returns:
            {
                'status': 'success|failed',
                'project': Dict,
                'tasks': List[Dict],
                'timeline': Dict,
                'resources': Dict,
                'recommendations': List[str]
            }
        """
        operation = params.get('operation', 'create')
        project_id = params.get('project_id')
        options = params.get('options', {})

        self.logger.info(f"Project planning operation: {operation}")

        # Mock project data
        project = {
            'id': 'PRJ-456',
            'name': 'Acme Corp Website Redesign',
            'description': 'Complete redesign and development of corporate website',
            'status': 'in_progress',
            'priority': 'high',
            'start_date': '2025-10-01',
            'target_end_date': '2025-12-31',
            'actual_end_date': None,
            'completion_percentage': 62,
            'budget': 150000.00,
            'spent': 93000.00,
            'budget_remaining': 57000.00,
            'team_size': 8,
            'client': 'Acme Corporation',
            'project_manager': 'Sarah Johnson',
            'stakeholders': [
                'John Acme (CEO)',
                'Mary Smith (Marketing Director)',
                'Tom Brown (IT Director)'
            ],
            'health_status': 'at_risk',
            'risk_level': 'medium'
        }

        # Mock tasks
        tasks = [
            {
                'id': 'TASK-001',
                'title': 'Design Homepage Mockup',
                'description': 'Create high-fidelity mockup for homepage',
                'status': 'completed',
                'priority': 'high',
                'assignee': 'EMP-234',
                'assignee_name': 'Emily Designer',
                'estimated_hours': 40,
                'actual_hours': 38,
                'start_date': '2025-10-01',
                'due_date': '2025-10-15',
                'completed_date': '2025-10-14',
                'dependencies': [],
                'progress': 100,
                'tags': ['design', 'ui']
            },
            {
                'id': 'TASK-002',
                'title': 'Develop Frontend Components',
                'description': 'Build React components for homepage',
                'status': 'in_progress',
                'priority': 'high',
                'assignee': 'EMP-123',
                'assignee_name': 'John Smith',
                'estimated_hours': 80,
                'actual_hours': 52,
                'start_date': '2025-10-16',
                'due_date': '2025-11-15',
                'completed_date': None,
                'dependencies': ['TASK-001'],
                'progress': 65,
                'tags': ['development', 'frontend'],
                'blocked': False
            },
            {
                'id': 'TASK-003',
                'title': 'Setup Backend API',
                'description': 'Create REST API for content management',
                'status': 'in_progress',
                'priority': 'high',
                'assignee': 'EMP-789',
                'assignee_name': 'Mike Chen',
                'estimated_hours': 60,
                'actual_hours': 35,
                'start_date': '2025-10-10',
                'due_date': '2025-11-10',
                'completed_date': None,
                'dependencies': [],
                'progress': 58,
                'tags': ['development', 'backend'],
                'blocked': False
            },
            {
                'id': 'TASK-004',
                'title': 'Content Migration',
                'description': 'Migrate content from old site to new CMS',
                'status': 'not_started',
                'priority': 'medium',
                'assignee': 'EMP-456',
                'assignee_name': 'Sarah Johnson',
                'estimated_hours': 30,
                'actual_hours': 0,
                'start_date': '2025-11-20',
                'due_date': '2025-12-05',
                'completed_date': None,
                'dependencies': ['TASK-003'],
                'progress': 0,
                'tags': ['content'],
                'blocked': True,
                'blocked_by': 'TASK-003'
            },
            {
                'id': 'TASK-005',
                'title': 'Performance Testing',
                'description': 'Conduct load and performance testing',
                'status': 'not_started',
                'priority': 'high',
                'assignee': 'EMP-567',
                'assignee_name': 'David Lee',
                'estimated_hours': 24,
                'actual_hours': 0,
                'start_date': '2025-12-10',
                'due_date': '2025-12-20',
                'completed_date': None,
                'dependencies': ['TASK-002', 'TASK-003'],
                'progress': 0,
                'tags': ['testing', 'qa']
            },
            {
                'id': 'TASK-006',
                'title': 'UAT with Client',
                'description': 'User acceptance testing with stakeholders',
                'status': 'not_started',
                'priority': 'critical',
                'assignee': 'EMP-456',
                'assignee_name': 'Sarah Johnson',
                'estimated_hours': 16,
                'actual_hours': 0,
                'start_date': '2025-12-15',
                'due_date': '2025-12-22',
                'completed_date': None,
                'dependencies': ['TASK-005'],
                'progress': 0,
                'tags': ['testing', 'client']
            },
            {
                'id': 'TASK-007',
                'title': 'Production Deployment',
                'description': 'Deploy to production environment',
                'status': 'not_started',
                'priority': 'critical',
                'assignee': 'EMP-789',
                'assignee_name': 'Mike Chen',
                'estimated_hours': 8,
                'actual_hours': 0,
                'start_date': '2025-12-28',
                'due_date': '2025-12-31',
                'completed_date': None,
                'dependencies': ['TASK-006'],
                'progress': 0,
                'tags': ['deployment', 'devops']
            }
        ]

        # Mock milestones
        milestones = [
            {
                'id': 'MS-001',
                'name': 'Design Approval',
                'date': '2025-10-20',
                'status': 'completed',
                'completion_date': '2025-10-19'
            },
            {
                'id': 'MS-002',
                'name': 'Development Phase Complete',
                'date': '2025-11-30',
                'status': 'at_risk',
                'risk_reason': 'Tasks running behind schedule'
            },
            {
                'id': 'MS-003',
                'name': 'Testing Complete',
                'date': '2025-12-22',
                'status': 'on_track'
            },
            {
                'id': 'MS-004',
                'name': 'Go Live',
                'date': '2025-12-31',
                'status': 'on_track'
            }
        ]

        # Mock resource allocation
        resource_allocation = {
            'EMP-123': {
                'name': 'John Smith',
                'role': 'Frontend Developer',
                'allocation_percentage': 80,
                'hours_allocated': 140,
                'hours_logged': 87,
                'utilization': 0.62,
                'availability': 0.20,
                'tasks_assigned': 3
            },
            'EMP-789': {
                'name': 'Mike Chen',
                'role': 'Backend Developer',
                'allocation_percentage': 75,
                'hours_allocated': 120,
                'hours_logged': 76,
                'utilization': 0.63,
                'availability': 0.25,
                'tasks_assigned': 2
            },
            'EMP-234': {
                'name': 'Emily Designer',
                'role': 'UI/UX Designer',
                'allocation_percentage': 100,
                'hours_allocated': 60,
                'hours_logged': 58,
                'utilization': 0.97,
                'availability': 0.0,
                'tasks_assigned': 1
            },
            'EMP-456': {
                'name': 'Sarah Johnson',
                'role': 'Project Manager',
                'allocation_percentage': 30,
                'hours_allocated': 50,
                'hours_logged': 42,
                'utilization': 0.84,
                'availability': 0.70,
                'tasks_assigned': 2
            }
        }

        # Mock timeline analysis
        timeline_analysis = {
            'original_duration_days': 92,
            'current_duration_days': 92,
            'elapsed_days': 46,
            'remaining_days': 46,
            'completion_percentage': 62,
            'expected_completion_date': '2026-01-10',
            'variance_days': 10,
            'on_schedule': False,
            'critical_path': ['TASK-002', 'TASK-005', 'TASK-006', 'TASK-007'],
            'critical_path_duration_days': 50,
            'float_available_days': 0
        }

        # Mock risks
        risks = [
            {
                'id': 'RISK-001',
                'title': 'Resource Availability',
                'description': 'Key developer may be pulled to emergency project',
                'probability': 'medium',
                'impact': 'high',
                'severity': 'high',
                'mitigation': 'Cross-train backup developer',
                'status': 'monitoring'
            },
            {
                'id': 'RISK-002',
                'title': 'Client Approval Delays',
                'description': 'Client stakeholders slow to provide feedback',
                'probability': 'high',
                'impact': 'medium',
                'severity': 'medium',
                'mitigation': 'Schedule dedicated review sessions',
                'status': 'active'
            },
            {
                'id': 'RISK-003',
                'title': 'Scope Creep',
                'description': 'Additional feature requests from client',
                'probability': 'medium',
                'impact': 'high',
                'severity': 'high',
                'mitigation': 'Implement formal change request process',
                'status': 'mitigated'
            }
        ]

        # Mock progress analytics
        analytics = {
            'total_tasks': len(tasks),
            'completed_tasks': len([t for t in tasks if t['status'] == 'completed']),
            'in_progress_tasks': len([t for t in tasks if t['status'] == 'in_progress']),
            'not_started_tasks': len([t for t in tasks if t['status'] == 'not_started']),
            'blocked_tasks': len([t for t in tasks if t.get('blocked', False)]),
            'overdue_tasks': 2,
            'completion_rate': 0.143,
            'estimated_total_hours': sum(t['estimated_hours'] for t in tasks),
            'actual_total_hours': sum(t['actual_hours'] for t in tasks),
            'variance_hours': -33,  # Under estimate
            'team_velocity': 45.5,  # hours per week
            'projected_completion': '2026-01-10',
            'budget_health': 'at_risk',
            'schedule_health': 'at_risk',
            'resource_health': 'good'
        }

        return {
            'status': 'success',
            'operation': operation,
            'project': project,
            'tasks': tasks,
            'milestones': milestones,
            'resource_allocation': resource_allocation,
            'timeline_analysis': timeline_analysis,
            'risks': risks,
            'analytics': analytics,
            'gantt_chart_data': {
                'tasks': [
                    {
                        'id': task['id'],
                        'name': task['title'],
                        'start': task['start_date'],
                        'end': task['due_date'],
                        'progress': task['progress'],
                        'dependencies': task['dependencies']
                    }
                    for task in tasks
                ]
            },
            'burn_down': {
                'total_story_points': 258,
                'completed_story_points': 160,
                'remaining_story_points': 98,
                'ideal_burn_rate': 2.8,
                'actual_burn_rate': 3.5,
                'trend': 'ahead'
            },
            'recommendations': [
                'Project is 10 days behind schedule - expedite TASK-002',
                'Budget at 62% utilized with 62% completion - monitor spending',
                'TASK-004 is blocked - prioritize completion of TASK-003',
                'Critical path has no float - any delay will impact delivery',
                'Address RISK-002 (client approval delays) immediately',
                'Consider adding resources to frontend development',
                'Schedule checkpoint meeting with stakeholders'
            ],
            'next_steps': [
                'Update client on current status and risks',
                'Prioritize critical path tasks',
                'Resolve blocking issues on TASK-004',
                'Review and update resource allocations',
                'Implement risk mitigation strategies',
                'Schedule UAT sessions with client',
                'Prepare contingency plan for potential delays'
            ]
        }

    def validate_params(self, params: Dict[str, Any]) -> bool:
        """Validate project planning parameters."""
        valid_operations = [
            'create', 'update', 'track', 'allocate', 'forecast'
        ]

        operation = params.get('operation')
        if operation and operation not in valid_operations:
            self.logger.error(f"Invalid operation: {operation}")
            return False

        return True
