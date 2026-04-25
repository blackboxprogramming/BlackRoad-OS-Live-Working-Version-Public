#!/usr/bin/env python3
"""
Revenue & Financial Tracking System
Real-time revenue, expenses, and profitability tracking

Author: Alexa Amundson
Copyright: BlackRoad OS, Inc.
"""

import json
from datetime import datetime, timedelta
import random

def generate_revenue_projections():
    """Generate conservative, realistic, and optimistic revenue projections"""

    current_month = datetime.now().month
    current_year = datetime.now().year

    projections = {
        "current_state": {
            "historical_revenue": {
                "total_all_time": 26800000,
                "breakdown": {
                    "securian_sales_commissions": 26800000,
                    "blackroad_saas": 0,
                    "consulting": 0,
                    "licensing": 0,
                    "sponsorships": 0
                }
            },
            "current_monthly_burn": 0,
            "runway_months": "infinite",
            "cash_position": 32350,  # Crypto holdings
            "assets": {
                "crypto": 32350,
                "equipment": 5000,
                "domains": 2000,
                "total": 39350
            }
        },

        "revenue_streams": {
            "1_open_source_sponsorships": {
                "description": "GitHub Sponsors + direct support",
                "pricing": {
                    "friend": {"price": 5, "monthly": True},
                    "supporter": {"price": 25, "monthly": True},
                    "sponsor": {"price": 100, "monthly": True}
                },
                "projections": {
                    "conservative": {
                        "monthly": 100,
                        "annual": 1200,
                        "customers": {"friend": 10, "supporter": 3, "sponsor": 0}
                    },
                    "realistic": {
                        "monthly": 500,
                        "annual": 6000,
                        "customers": {"friend": 30, "supporter": 10, "sponsor": 2}
                    },
                    "optimistic": {
                        "monthly": 2500,
                        "annual": 30000,
                        "customers": {"friend": 100, "supporter": 40, "sponsor": 10}
                    }
                }
            },

            "2_commercial_licensing": {
                "description": "Commercial use licenses for businesses",
                "pricing": {
                    "startup": {"price": 499, "annual": True},
                    "business": {"price": 999, "annual": True},
                    "enterprise": {"price": 2499, "annual": True}
                },
                "projections": {
                    "conservative": {
                        "annual": 50000,
                        "customers": {"startup": 50, "business": 25, "enterprise": 5}
                    },
                    "realistic": {
                        "annual": 150000,
                        "customers": {"startup": 100, "business": 75, "enterprise": 20}
                    },
                    "optimistic": {
                        "annual": 500000,
                        "customers": {"startup": 300, "business": 200, "enterprise": 50}
                    }
                }
            },

            "3_consulting_integration": {
                "description": "Custom integration and consulting services",
                "pricing": {
                    "hourly": {"price": 250, "unit": "hour"},
                    "daily": {"price": 1500, "unit": "day"},
                    "project": {"price": 5000, "unit": "project"}
                },
                "projections": {
                    "conservative": {
                        "annual": 50000,
                        "breakdown": {
                            "hourly": {"hours": 100, "revenue": 25000},
                            "daily": {"days": 10, "revenue": 15000},
                            "project": {"projects": 2, "revenue": 10000}
                        }
                    },
                    "realistic": {
                        "annual": 150000,
                        "breakdown": {
                            "hourly": {"hours": 200, "revenue": 50000},
                            "daily": {"days": 40, "revenue": 60000},
                            "project": {"projects": 8, "revenue": 40000}
                        }
                    },
                    "optimistic": {
                        "annual": 500000,
                        "breakdown": {
                            "hourly": {"hours": 400, "revenue": 100000},
                            "daily": {"days": 100, "revenue": 150000},
                            "project": {"projects": 50, "revenue": 250000}
                        }
                    }
                }
            },

            "4_priority_support": {
                "description": "24/7 priority support with SLA",
                "pricing": {
                    "monthly": {"price": 499, "monthly": True}
                },
                "projections": {
                    "conservative": {
                        "monthly": 2500,
                        "annual": 30000,
                        "customers": 5
                    },
                    "realistic": {
                        "monthly": 10000,
                        "annual": 120000,
                        "customers": 20
                    },
                    "optimistic": {
                        "monthly": 25000,
                        "annual": 300000,
                        "customers": 50
                    }
                }
            },

            "5_saas_platform": {
                "description": "Multi-agent orchestration platform as SaaS",
                "pricing": {
                    "starter": {"price": 49, "monthly": True},
                    "professional": {"price": 199, "monthly": True},
                    "business": {"price": 499, "monthly": True},
                    "enterprise": {"price": 1999, "monthly": True}
                },
                "projections": {
                    "conservative": {
                        "monthly": 5000,
                        "annual": 60000,
                        "customers": {"starter": 50, "professional": 15, "business": 5, "enterprise": 1}
                    },
                    "realistic": {
                        "monthly": 25000,
                        "annual": 300000,
                        "customers": {"starter": 200, "professional": 80, "business": 30, "enterprise": 5}
                    },
                    "optimistic": {
                        "monthly": 100000,
                        "annual": 1200000,
                        "customers": {"starter": 1000, "professional": 300, "business": 100, "enterprise": 20}
                    }
                }
            },

            "6_job_income": {
                "description": "Full-time employment while building",
                "projections": {
                    "conservative": {
                        "annual": 120000,
                        "source": "AI/ML Engineer role"
                    },
                    "realistic": {
                        "annual": 180000,
                        "source": "Senior AI Engineer role"
                    },
                    "optimistic": {
                        "annual": 250000,
                        "source": "Staff/Principal Engineer role"
                    }
                }
            }
        },

        "total_projections": {
            "year_1_conservative": {
                "total_annual": 161200,
                "monthly_average": 13433,
                "breakdown": {
                    "job": 120000,
                    "sponsorships": 1200,
                    "licensing": 0,
                    "consulting": 10000,
                    "support": 0,
                    "saas": 0
                }
            },
            "year_1_realistic": {
                "total_annual": 456000,
                "monthly_average": 38000,
                "breakdown": {
                    "job": 180000,
                    "sponsorships": 6000,
                    "licensing": 50000,
                    "consulting": 100000,
                    "support": 60000,
                    "saas": 60000
                }
            },
            "year_1_optimistic": {
                "total_annual": 1280000,
                "monthly_average": 106667,
                "breakdown": {
                    "job": 250000,
                    "sponsorships": 30000,
                    "licensing": 200000,
                    "consulting": 300000,
                    "support": 100000,
                    "saas": 400000
                }
            },

            "year_3_conservative": {
                "total_annual": 280000,
                "monthly_average": 23333,
                "breakdown": {
                    "job": 150000,
                    "sponsorships": 5000,
                    "licensing": 50000,
                    "consulting": 50000,
                    "support": 25000,
                    "saas": 0
                }
            },
            "year_3_realistic": {
                "total_annual": 950000,
                "monthly_average": 79167,
                "breakdown": {
                    "job": 200000,
                    "sponsorships": 30000,
                    "licensing": 150000,
                    "consulting": 200000,
                    "support": 120000,
                    "saas": 250000
                }
            },
            "year_3_optimistic": {
                "total_annual": 3500000,
                "monthly_average": 291667,
                "breakdown": {
                    "job": 0,  # Full-time on BlackRoad
                    "sponsorships": 100000,
                    "licensing": 500000,
                    "consulting": 500000,
                    "support": 400000,
                    "saas": 2000000
                }
            }
        },

        "expenses": {
            "current_monthly": {
                "infrastructure": {
                    "cloudflare": 20,
                    "railway": 0,  # Currently paused
                    "domains": 50,
                    "github": 0,  # Free
                    "total": 70
                },
                "tools_software": {
                    "anthropic_api": 50,
                    "other_apis": 20,
                    "total": 70
                },
                "marketing": 0,
                "total_monthly": 140,
                "total_annual": 1680
            },

            "scaled_monthly": {
                "infrastructure": {
                    "cloudflare": 200,
                    "railway": 500,
                    "domains": 100,
                    "databases": 200,
                    "cdn_bandwidth": 300,
                    "total": 1300
                },
                "tools_software": {
                    "ai_apis": 500,
                    "monitoring": 200,
                    "analytics": 100,
                    "email": 50,
                    "total": 850
                },
                "marketing": {
                    "ads": 1000,
                    "content": 500,
                    "total": 1500
                },
                "team": {
                    "contractors": 5000,
                    "total": 5000
                },
                "total_monthly": 8650,
                "total_annual": 103800
            }
        },

        "profitability": {
            "year_1_conservative": {
                "revenue": 161200,
                "expenses": 1680,
                "profit": 159520,
                "margin_pct": 99.0
            },
            "year_1_realistic": {
                "revenue": 456000,
                "expenses": 20000,
                "profit": 436000,
                "margin_pct": 95.6
            },
            "year_1_optimistic": {
                "revenue": 1280000,
                "expenses": 103800,
                "profit": 1176200,
                "margin_pct": 91.9
            },

            "year_3_realistic": {
                "revenue": 950000,
                "expenses": 103800,
                "profit": 846200,
                "margin_pct": 89.1
            },
            "year_3_optimistic": {
                "revenue": 3500000,
                "expenses": 500000,
                "profit": 3000000,
                "margin_pct": 85.7
            }
        },

        "milestones": {
            "first_dollar": {
                "target_date": "2025-01-15",
                "source": "First GitHub sponsor or consulting client",
                "amount": 25
            },
            "first_1k_month": {
                "target_date": "2025-03-01",
                "source": "Mix of sponsors + consulting",
                "amount": 1000
            },
            "first_10k_month": {
                "target_date": "2025-06-01",
                "source": "Licensing + consulting + sponsors",
                "amount": 10000
            },
            "quit_job": {
                "target_date": "2025-12-01",
                "required_mrr": 20000,
                "safety_buffer": 100000
            },
            "first_100k_year": {
                "target_date": "2025-12-31",
                "source": "All revenue streams",
                "amount": 100000
            },
            "first_1m_year": {
                "target_date": "2027-12-31",
                "source": "SaaS scaling",
                "amount": 1000000
            }
        }
    }

    return projections

def generate_monthly_forecast(months=24):
    """Generate month-by-month forecast"""

    forecast = []
    start_date = datetime.now()

    for i in range(months):
        month_date = start_date + timedelta(days=30*i)

        # Growth curves (exponential for optimistic, linear for conservative)
        month_num = i + 1

        # Conservative: slow linear growth
        conservative_revenue = 1000 + (month_num * 500)

        # Realistic: steady growth with some acceleration
        realistic_revenue = 2000 + (month_num * 1500) + (month_num ** 1.5 * 100)

        # Optimistic: exponential growth
        optimistic_revenue = 5000 * (1.15 ** month_num)

        forecast.append({
            "month": month_date.strftime("%Y-%m"),
            "month_num": month_num,
            "conservative": {
                "revenue": int(conservative_revenue),
                "expenses": 150 + (month_num * 10),
                "profit": int(conservative_revenue - (150 + month_num * 10))
            },
            "realistic": {
                "revenue": int(realistic_revenue),
                "expenses": 500 + (month_num * 100),
                "profit": int(realistic_revenue - (500 + month_num * 100))
            },
            "optimistic": {
                "revenue": int(optimistic_revenue),
                "expenses": 1000 + (month_num * 300),
                "profit": int(optimistic_revenue - (1000 + month_num * 300))
            }
        })

    return forecast

def main():
    print("💰 Generating comprehensive financial projections...")

    projections = generate_revenue_projections()
    forecast = generate_monthly_forecast(24)

    output = {
        "data": {
            "projections": projections,
            "monthly_forecast": forecast,
            "summary": {
                "year_1_range": {
                    "min": 161200,
                    "likely": 456000,
                    "max": 1280000
                },
                "year_3_range": {
                    "min": 280000,
                    "likely": 950000,
                    "max": 3500000
                },
                "profitability": "High margins (85-99%) due to low overhead",
                "time_to_first_revenue": "2-4 weeks",
                "time_to_sustainability": "3-6 months",
                "time_to_full_time": "6-12 months"
            }
        },
        "metadata": {
            "updated_at": datetime.utcnow().isoformat() + 'Z',
            "source": "financial-modeling",
            "copyright": "© 2025 BlackRoad OS, Inc.",
            "confidential": True
        }
    }

    with open('revenue_projections.json', 'w') as f:
        json.dump(output, f, indent=2)

    print(f"✅ Financial projections generated")
    print(f"\n📊 Year 1 Projections:")
    print(f"   Conservative: ${projections['total_projections']['year_1_conservative']['total_annual']:,}")
    print(f"   Realistic:    ${projections['total_projections']['year_1_realistic']['total_annual']:,}")
    print(f"   Optimistic:   ${projections['total_projections']['year_1_optimistic']['total_annual']:,}")

    print(f"\n📊 Year 3 Projections:")
    print(f"   Conservative: ${projections['total_projections']['year_3_conservative']['total_annual']:,}")
    print(f"   Realistic:    ${projections['total_projections']['year_3_realistic']['total_annual']:,}")
    print(f"   Optimistic:   ${projections['total_projections']['year_3_optimistic']['total_annual']:,}")

    print(f"\n💡 Path to Full-Time:")
    print(f"   Required MRR: ${projections['milestones']['quit_job']['required_mrr']:,}")
    print(f"   Safety Buffer: ${projections['milestones']['quit_job']['safety_buffer']:,}")
    print(f"   Target Date: {projections['milestones']['quit_job']['target_date']}")

if __name__ == "__main__":
    main()
