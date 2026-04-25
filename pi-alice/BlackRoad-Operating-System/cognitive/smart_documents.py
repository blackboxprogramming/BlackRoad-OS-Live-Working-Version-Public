"""
Smart Document Processing - OCR, ATS-friendly, Auto-organizing

This is what document management should be:
- OCR: Extract text from images and PDFs automatically
- ATS-friendly: Format resumes/documents for applicant tracking systems
- Auto-format: Documents format themselves for their purpose
- Template matching: Automatically apply the right template
- Structure extraction: Pull out structured data from documents
- Auto-filing: Documents organize themselves (via Semantic FS)

Combines Notion + Asana + business planning + actual functionality
"""

from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from pathlib import Path
from typing import Dict, List, Optional, Set, Any
import re
import json


class DocumentTemplate(Enum):
    """Document templates"""
    RESUME_ATS = "resume_ats"
    RESUME_CREATIVE = "resume_creative"
    COVER_LETTER = "cover_letter"
    BUSINESS_PLAN = "business_plan"
    TECHNICAL_SPEC = "technical_spec"
    MEETING_NOTES = "meeting_notes"
    PROPOSAL = "proposal"
    INVOICE = "invoice"
    CONTRACT = "contract"
    REPORT = "report"
    BLANK = "blank"


@dataclass
class ExtractedText:
    """Text extracted from a document"""
    content: str
    confidence: float = 0.0  # OCR confidence
    language: str = "en"
    page_number: Optional[int] = None
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class StructuredData:
    """Structured data extracted from a document"""
    document_type: str
    fields: Dict[str, Any] = field(default_factory=dict)
    entities: Dict[str, List[str]] = field(default_factory=dict)
    sections: List[Dict[str, str]] = field(default_factory=list)
    confidence: float = 0.0


class SmartDocument:
    """
    A smart document that can:
    - Read itself (OCR)
    - Format itself (templates)
    - Organize itself (semantic FS)
    - Update itself (living docs)
    """

    def __init__(self, file_path: str):
        self.file_path = file_path
        self.extracted_text: Optional[ExtractedText] = None
        self.structured_data: Optional[StructuredData] = None
        self.suggested_template: Optional[DocumentTemplate] = None
        self.metadata: Dict[str, Any] = {}

    def extract_text(self) -> ExtractedText:
        """
        Extract text from document using OCR if needed.

        For PDFs: Use pdfplumber or similar
        For images: Use Tesseract OCR
        For Word docs: Use python-docx
        """
        ext = Path(self.file_path).suffix.lower()

        # For now, simplified - in production, use actual OCR
        if ext in ['.txt', '.md']:
            with open(self.file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
                self.extracted_text = ExtractedText(
                    content=content,
                    confidence=1.0
                )

        elif ext == '.pdf':
            # In production: use pdfplumber, PyPDF2, or similar
            # try:
            #     import pdfplumber
            #     with pdfplumber.open(self.file_path) as pdf:
            #         content = '\n'.join(page.extract_text() for page in pdf.pages)
            #     self.extracted_text = ExtractedText(content=content, confidence=0.95)
            # except:
            #     pass
            self.extracted_text = ExtractedText(
                content="[PDF extraction requires pdfplumber]",
                confidence=0.0
            )

        elif ext in ['.png', '.jpg', '.jpeg', '.tiff']:
            # In production: use Tesseract OCR
            # try:
            #     import pytesseract
            #     from PIL import Image
            #     img = Image.open(self.file_path)
            #     content = pytesseract.image_to_string(img)
            #     self.extracted_text = ExtractedText(content=content, confidence=0.8)
            # except:
            #     pass
            self.extracted_text = ExtractedText(
                content="[OCR requires pytesseract]",
                confidence=0.0
            )

        elif ext in ['.docx', '.doc']:
            # In production: use python-docx
            # try:
            #     import docx
            #     doc = docx.Document(self.file_path)
            #     content = '\n'.join(para.text for para in doc.paragraphs)
            #     self.extracted_text = ExtractedText(content=content, confidence=1.0)
            # except:
            #     pass
            self.extracted_text = ExtractedText(
                content="[DOCX extraction requires python-docx]",
                confidence=0.0
            )

        return self.extracted_text or ExtractedText(content="", confidence=0.0)

    def extract_structured_data(self) -> StructuredData:
        """
        Extract structured data from the document.

        For resumes: name, contact, experience, education, skills
        For business plans: executive summary, financials, market analysis
        For contracts: parties, terms, dates, amounts
        """
        if not self.extracted_text:
            self.extract_text()

        content = self.extracted_text.content if self.extracted_text else ""

        # Detect document type
        doc_type = self._detect_document_type(content)

        structured = StructuredData(document_type=doc_type)

        # Extract based on type
        if doc_type == "resume":
            structured.fields = self._extract_resume_fields(content)
        elif doc_type == "business_plan":
            structured.fields = self._extract_business_plan_fields(content)
        elif doc_type == "meeting_notes":
            structured.fields = self._extract_meeting_fields(content)

        # Extract common entities
        structured.entities = self._extract_entities(content)

        self.structured_data = structured
        return structured

    def _detect_document_type(self, content: str) -> str:
        """Detect what type of document this is"""
        content_lower = content.lower()

        # Resume detection
        resume_indicators = ['resume', 'curriculum vitae', 'experience', 'education', 'skills']
        resume_score = sum(1 for ind in resume_indicators if ind in content_lower)
        if resume_score >= 3:
            return "resume"

        # Business plan
        if 'executive summary' in content_lower and 'market analysis' in content_lower:
            return "business_plan"

        # Meeting notes
        if 'meeting' in content_lower and 'attendees' in content_lower:
            return "meeting_notes"

        # Contract
        if 'agreement' in content_lower and 'parties' in content_lower:
            return "contract"

        return "unknown"

    def _extract_resume_fields(self, content: str) -> Dict[str, Any]:
        """Extract structured fields from a resume"""
        fields = {}

        # Extract name (usually first line or prominent text)
        lines = [line.strip() for line in content.split('\n') if line.strip()]
        if lines:
            # Name is often the first non-empty line
            fields['name'] = lines[0]

        # Extract email
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        emails = re.findall(email_pattern, content)
        if emails:
            fields['email'] = emails[0]

        # Extract phone
        phone_pattern = r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b'
        phones = re.findall(phone_pattern, content)
        if phones:
            fields['phone'] = phones[0]

        # Extract sections
        sections = {}
        current_section = None

        for line in lines:
            line_lower = line.lower()

            # Detect section headers
            if any(keyword in line_lower for keyword in ['experience', 'employment', 'work history']):
                current_section = 'experience'
                sections[current_section] = []
            elif any(keyword in line_lower for keyword in ['education', 'academic']):
                current_section = 'education'
                sections[current_section] = []
            elif any(keyword in line_lower for keyword in ['skills', 'technical skills', 'competencies']):
                current_section = 'skills'
                sections[current_section] = []
            elif current_section:
                sections[current_section].append(line)

        fields['sections'] = sections

        return fields

    def _extract_business_plan_fields(self, content: str) -> Dict[str, Any]:
        """Extract fields from a business plan"""
        fields = {}

        # Look for key sections
        sections = {
            'executive_summary': r'executive summary[:\n](.*?)(?=\n\n[A-Z]|\Z)',
            'market_analysis': r'market analysis[:\n](.*?)(?=\n\n[A-Z]|\Z)',
            'financial_projections': r'financial projections[:\n](.*?)(?=\n\n[A-Z]|\Z)',
            'business_model': r'business model[:\n](.*?)(?=\n\n[A-Z]|\Z)',
        }

        for section_name, pattern in sections.items():
            match = re.search(pattern, content, re.IGNORECASE | re.DOTALL)
            if match:
                fields[section_name] = match.group(1).strip()

        return fields

    def _extract_meeting_fields(self, content: str) -> Dict[str, Any]:
        """Extract fields from meeting notes"""
        fields = {}

        # Extract date
        date_pattern = r'\b\d{1,2}/\d{1,2}/\d{2,4}\b'
        dates = re.findall(date_pattern, content)
        if dates:
            fields['date'] = dates[0]

        # Extract attendees
        attendees_match = re.search(r'attendees[:\s]+(.*?)(?=\n\n|\Z)', content, re.IGNORECASE | re.DOTALL)
        if attendees_match:
            attendees = [name.strip() for name in attendees_match.group(1).split(',')]
            fields['attendees'] = attendees

        # Extract action items
        action_items = []
        for line in content.split('\n'):
            if any(marker in line.lower() for marker in ['action:', 'todo:', '- [ ]', 'task:']):
                action_items.append(line.strip())
        if action_items:
            fields['action_items'] = action_items

        return fields

    def _extract_entities(self, content: str) -> Dict[str, List[str]]:
        """Extract named entities"""
        entities = {
            'emails': [],
            'urls': [],
            'dates': [],
            'phone_numbers': [],
            'monetary_amounts': []
        }

        # Emails
        entities['emails'] = re.findall(r'\b[\w.-]+@[\w.-]+\.\w+\b', content)

        # URLs
        entities['urls'] = re.findall(r'https?://[^\s]+', content)

        # Dates
        entities['dates'] = re.findall(r'\b\d{1,2}/\d{1,2}/\d{2,4}\b', content)

        # Phone numbers
        entities['phone_numbers'] = re.findall(r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b', content)

        # Monetary amounts
        entities['monetary_amounts'] = re.findall(r'\$[\d,]+\.?\d*', content)

        return entities

    def suggest_template(self) -> DocumentTemplate:
        """Suggest the best template for this document"""
        if not self.structured_data:
            self.extract_structured_data()

        doc_type = self.structured_data.document_type if self.structured_data else "unknown"

        template_map = {
            "resume": DocumentTemplate.RESUME_ATS,
            "business_plan": DocumentTemplate.BUSINESS_PLAN,
            "meeting_notes": DocumentTemplate.MEETING_NOTES,
            "contract": DocumentTemplate.CONTRACT
        }

        self.suggested_template = template_map.get(doc_type, DocumentTemplate.BLANK)
        return self.suggested_template

    def format_as_ats_friendly(self) -> str:
        """
        Format document as ATS-friendly (for resumes).

        ATS (Applicant Tracking System) requirements:
        - Simple formatting (no tables, columns, graphics)
        - Standard section headers
        - Plain text
        - Standard fonts
        - No headers/footers
        - .docx or .pdf format
        """
        if not self.structured_data:
            self.extract_structured_data()

        if not self.structured_data or self.structured_data.document_type != "resume":
            return self.extracted_text.content if self.extracted_text else ""

        # Build ATS-friendly version
        output = []

        # Name
        if 'name' in self.structured_data.fields:
            output.append(self.structured_data.fields['name'].upper())
            output.append('')

        # Contact info
        contact_parts = []
        if 'email' in self.structured_data.fields:
            contact_parts.append(self.structured_data.fields['email'])
        if 'phone' in self.structured_data.fields:
            contact_parts.append(self.structured_data.fields['phone'])

        if contact_parts:
            output.append(' | '.join(contact_parts))
            output.append('')

        # Sections
        sections_data = self.structured_data.fields.get('sections', {})

        # Experience section
        if 'experience' in sections_data:
            output.append('PROFESSIONAL EXPERIENCE')
            output.append('-' * 50)
            output.extend(sections_data['experience'])
            output.append('')

        # Education section
        if 'education' in sections_data:
            output.append('EDUCATION')
            output.append('-' * 50)
            output.extend(sections_data['education'])
            output.append('')

        # Skills section
        if 'skills' in sections_data:
            output.append('SKILLS')
            output.append('-' * 50)
            output.extend(sections_data['skills'])
            output.append('')

        return '\n'.join(output)

    def apply_template(self, template: DocumentTemplate, output_path: str) -> None:
        """
        Apply a template to the document and save.

        Templates define structure and formatting for different document types.
        """
        if not self.structured_data:
            self.extract_structured_data()

        content = ""

        if template == DocumentTemplate.RESUME_ATS:
            content = self.format_as_ats_friendly()

        elif template == DocumentTemplate.MEETING_NOTES:
            content = self._format_meeting_notes()

        elif template == DocumentTemplate.BUSINESS_PLAN:
            content = self._format_business_plan()

        else:
            content = self.extracted_text.content if self.extracted_text else ""

        # Save to file
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(content)

    def _format_meeting_notes(self) -> str:
        """Format as structured meeting notes"""
        if not self.structured_data:
            return ""

        output = []
        fields = self.structured_data.fields

        output.append("# Meeting Notes")
        output.append("")

        if 'date' in fields:
            output.append(f"**Date:** {fields['date']}")

        if 'attendees' in fields:
            output.append(f"**Attendees:** {', '.join(fields['attendees'])}")

        output.append("")
        output.append("## Discussion")
        output.append("")

        if 'action_items' in fields:
            output.append("## Action Items")
            output.append("")
            for item in fields['action_items']:
                output.append(f"- [ ] {item}")

        return '\n'.join(output)

    def _format_business_plan(self) -> str:
        """Format as structured business plan"""
        if not self.structured_data:
            return ""

        output = []
        fields = self.structured_data.fields

        output.append("# Business Plan")
        output.append("")

        if 'executive_summary' in fields:
            output.append("## Executive Summary")
            output.append("")
            output.append(fields['executive_summary'])
            output.append("")

        if 'market_analysis' in fields:
            output.append("## Market Analysis")
            output.append("")
            output.append(fields['market_analysis'])
            output.append("")

        if 'business_model' in fields:
            output.append("## Business Model")
            output.append("")
            output.append(fields['business_model'])
            output.append("")

        if 'financial_projections' in fields:
            output.append("## Financial Projections")
            output.append("")
            output.append(fields['financial_projections'])
            output.append("")

        return '\n'.join(output)


class DocumentProcessor:
    """
    Central processor for smart documents.

    Integrates with:
    - Semantic FS (auto-filing)
    - Living Docs (code-aware docs)
    - Intent Graph (track purpose)
    """

    def __init__(self, semantic_fs=None, doc_manager=None, intent_graph=None):
        self.semantic_fs = semantic_fs
        self.doc_manager = doc_manager
        self.intent_graph = intent_graph

    def process_document(self, file_path: str, auto_organize: bool = True,
                        apply_template: bool = True) -> SmartDocument:
        """
        Fully process a document:
        1. Extract text (OCR if needed)
        2. Extract structured data
        3. Suggest/apply template
        4. Auto-organize into correct folder
        5. Link to intent graph
        """
        doc = SmartDocument(file_path)

        # Extract text and structure
        doc.extract_text()
        doc.extract_structured_data()

        # Index in semantic FS
        if self.semantic_fs:
            self.semantic_fs.index_file(file_path)

            # Auto-organize
            if auto_organize:
                suggested_path = self.semantic_fs.suggest_location(file_path)
                print(f"Suggested location: {suggested_path}")

        # Suggest template
        template = doc.suggest_template()

        # Apply template if requested
        if apply_template and template != DocumentTemplate.BLANK:
            output_path = str(Path(file_path).with_suffix('.formatted.txt'))
            doc.apply_template(template, output_path)
            print(f"Formatted document saved to: {output_path}")

        return doc

    def create_from_template(self, template: DocumentTemplate,
                           output_path: str, data: Optional[Dict] = None) -> str:
        """
        Create a new document from a template.

        This is like Notion/Asana templates but better - they're smart!
        """
        content = ""

        if template == DocumentTemplate.RESUME_ATS:
            content = self._create_resume_template(data or {})
        elif template == DocumentTemplate.MEETING_NOTES:
            content = self._create_meeting_template(data or {})
        elif template == DocumentTemplate.BUSINESS_PLAN:
            content = self._create_business_plan_template(data or {})

        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(content)

        # Index it
        if self.semantic_fs:
            self.semantic_fs.index_file(output_path)

        return output_path

    def _create_resume_template(self, data: Dict) -> str:
        """Create ATS-friendly resume template"""
        return f"""[YOUR NAME]

[Email] | [Phone] | [LinkedIn] | [Location]

PROFESSIONAL SUMMARY
---
[2-3 sentences about your professional background and key strengths]

PROFESSIONAL EXPERIENCE
---
[Company Name] | [Job Title] | [Start Date] - [End Date]
- [Achievement or responsibility]
- [Achievement or responsibility]
- [Achievement or responsibility]

[Company Name] | [Job Title] | [Start Date] - [End Date]
- [Achievement or responsibility]
- [Achievement or responsibility]

EDUCATION
---
[Degree] in [Field] | [University Name] | [Graduation Year]
- [Relevant coursework, honors, or achievements]

SKILLS
---
Technical: [List technical skills]
Tools: [List tools and software]
Languages: [List programming/spoken languages]
"""

    def _create_meeting_template(self, data: Dict) -> str:
        """Create meeting notes template"""
        date = data.get('date', '[Date]')
        return f"""# Meeting Notes

**Date:** {date}
**Attendees:** [List attendees]
**Duration:** [Duration]

## Agenda
1. [Topic 1]
2. [Topic 2]
3. [Topic 3]

## Discussion

### Topic 1
[Notes]

### Topic 2
[Notes]

## Decisions Made
- [Decision 1]
- [Decision 2]

## Action Items
- [ ] [Action item] - [Owner] - [Due date]
- [ ] [Action item] - [Owner] - [Due date]

## Next Steps
[What happens next]

## Next Meeting
**Date:** [Date]
**Time:** [Time]
"""

    def _create_business_plan_template(self, data: Dict) -> str:
        """Create business plan template"""
        return """# Business Plan: [Company Name]

## Executive Summary
[1-2 page summary of the entire business plan]

## Company Description
- **Mission:** [Mission statement]
- **Vision:** [Vision statement]
- **Legal Structure:** [LLC, Corp, etc.]
- **Location:** [Where based]

## Market Analysis
### Target Market
- **Demographics:** [Who are your customers]
- **Market Size:** [How big is the market]
- **Growth Potential:** [Is it growing?]

### Competitive Analysis
- **Competitors:** [Who are they]
- **Competitive Advantage:** [What makes you different]

## Products and Services
[Describe what you're selling]

## Marketing and Sales Strategy
- **Marketing Channels:** [How you'll reach customers]
- **Sales Process:** [How you'll close deals]
- **Pricing Strategy:** [How you'll price]

## Operations Plan
[How the business will operate day-to-day]

## Management Team
- **Founder/CEO:** [Name and background]
- **Key Team Members:** [Names and roles]

## Financial Projections
### Revenue Projections
- Year 1: $[Amount]
- Year 2: $[Amount]
- Year 3: $[Amount]

### Expenses
- Fixed Costs: $[Amount]
- Variable Costs: $[Amount]

### Funding Needs
- **Amount Needed:** $[Amount]
- **Use of Funds:** [How money will be used]

## Appendix
[Supporting documents, charts, etc.]
"""


# Example usage
if __name__ == "__main__":
    # processor = DocumentProcessor()

    # Process a resume
    # doc = processor.process_document("~/Downloads/resume.pdf")
    # print(f"Document type: {doc.structured_data.document_type}")
    # print(f"Suggested template: {doc.suggested_template}")

    # Create a new document from template
    # processor.create_from_template(
    #     DocumentTemplate.MEETING_NOTES,
    #     "meeting_2024_01_15.md",
    #     data={'date': '2024-01-15'}
    # )

    print("Smart Document Processing initialized")
