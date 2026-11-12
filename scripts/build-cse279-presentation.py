import os
import sys
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
from pptx.oxml import parse_xml

# Resolve paths
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, ".."))
SCREENSHOTS_DIR = os.path.join(PROJECT_DIR, "assets", "screenshots")
OUTPUT_PPTX = os.path.join(PROJECT_DIR, "PantryChef_Project_Presentation.pptx")

# Palette Constants
COLOR_CREAM_BG   = RGBColor(250, 247, 242)
COLOR_CARD_BG    = RGBColor(255, 255, 255)
COLOR_CARD_TINT  = RGBColor(245, 239, 230)
COLOR_BORDER     = RGBColor(226, 214, 200)
COLOR_ESPRESSO   = RGBColor(30, 21, 16)
COLOR_MUTED      = RGBColor(85, 65, 50)
COLOR_PAPRIKA    = RGBColor(206, 62, 34)
COLOR_SAFFRON    = RGBColor(201, 122, 0)
COLOR_BASIL      = RGBColor(45, 106, 79)
COLOR_FRAME      = RGBColor(43, 30, 22)
COLOR_CODE_BG    = RGBColor(30, 30, 30)

FONT_TITLE = "Georgia"
FONT_BODY  = "Calibri"

prs = Presentation()
prs.slide_width  = Inches(13.333)
prs.slide_height = Inches(7.5)
blank_layout     = prs.slide_layouts[6]

def apply_background_and_transition(slide):
    bg = slide.background
    fill = bg.fill
    fill.solid()
    fill.fore_color.rgb = COLOR_CREAM_BG
    tx_xml = parse_xml('<p:transition xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" spd="med"><p:fade/></p:transition>')
    slide._element.append(tx_xml)

def add_header(slide, section_label, title_text, subtitle_text=None):
    badge = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(0.38), Inches(3.4), Inches(0.30))
    badge.fill.solid()
    badge.fill.fore_color.rgb = COLOR_PAPRIKA
    badge.line.fill.background()
    tf_b = badge.text_frame
    tf_b.word_wrap = False
    tf_b.vertical_anchor = MSO_ANCHOR.MIDDLE
    p_b = tf_b.paragraphs[0]
    p_b.alignment = PP_ALIGN.CENTER
    p_b.text = section_label.upper()
    p_b.font.name = FONT_BODY
    p_b.font.size = Pt(9.5)
    p_b.font.bold = True
    p_b.font.color.rgb = RGBColor(255, 255, 255)

    t_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.70), Inches(11.733), Inches(0.55))
    tf_t = t_box.text_frame
    tf_t.word_wrap = True
    tf_t.margin_left = tf_t.margin_right = tf_t.margin_top = tf_t.margin_bottom = 0
    p_t = tf_t.paragraphs[0]
    p_t.text = title_text
    p_t.font.name = FONT_TITLE
    p_t.font.size = Pt(21)
    p_t.font.bold = True
    p_t.font.color.rgb = COLOR_ESPRESSO

    if subtitle_text:
        s_box = slide.shapes.add_textbox(Inches(0.8), Inches(1.24), Inches(11.733), Inches(0.32))
        tf_s = s_box.text_frame
        tf_s.word_wrap = True
        tf_s.margin_left = tf_s.margin_right = tf_s.margin_top = tf_s.margin_bottom = 0
        p_s = tf_s.paragraphs[0]
        p_s.text = subtitle_text
        p_s.font.name = FONT_BODY
        p_s.font.size = Pt(11)
        p_s.font.color.rgb = COLOR_MUTED

def set_speaker_notes(slide, notes_text):
    notes_slide = slide.notes_slide
    tf = notes_slide.notes_text_frame
    tf.text = notes_text.strip()

def add_card(slide, left, top, width, height, fill_color=COLOR_CARD_BG, border_color=COLOR_BORDER):
    card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
    card.fill.solid()
    card.fill.fore_color.rgb = fill_color
    if border_color:
        card.line.color.rgb = border_color
        card.line.width = Pt(1)
    else:
        card.line.fill.background()
    return card

def add_device_laptop(slide, left, top, width, height, img_name, caption=None):
    img_path = os.path.join(SCREENSHOTS_DIR, img_name)
    bezel = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height * 0.90)
    bezel.fill.solid()
    bezel.fill.fore_color.rgb = COLOR_FRAME
    bezel.line.fill.background()

    tray = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left - width * 0.05, top + height * 0.88, width * 1.10, height * 0.08)
    tray.fill.solid()
    tray.fill.fore_color.rgb = RGBColor(190, 180, 170)
    tray.line.fill.background()

    pad_x = width * 0.025
    pad_y = height * 0.035
    img_w = width - (pad_x * 2)
    img_h = (height * 0.90) - (pad_y * 2)
    if os.path.exists(img_path):
        slide.shapes.add_picture(img_path, left + pad_x, top + pad_y, img_w, img_h)

    if caption:
        c_box = slide.shapes.add_textbox(left - width * 0.05, top + height + Inches(0.04), width * 1.10, Inches(0.28))
        tf = c_box.text_frame
        tf.margin_top = tf.margin_bottom = 0
        p = tf.paragraphs[0]
        p.alignment = PP_ALIGN.CENTER
        p.text = caption
        p.font.name = FONT_BODY
        p.font.size = Pt(8.5)
        p.font.italic = True
        p.font.color.rgb = COLOR_MUTED

def add_device_phone(slide, left, top, width, height, img_name, caption=None):
    img_path = os.path.join(SCREENSHOTS_DIR, img_name)
    frame = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
    frame.fill.solid()
    frame.fill.fore_color.rgb = COLOR_FRAME
    frame.line.color.rgb = RGBColor(60, 45, 35)
    frame.line.width = Pt(1.5)

    notch_w = width * 0.28
    notch_h = height * 0.025
    notch = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left + (width - notch_w) / 2, top + height * 0.015, notch_w, notch_h)
    notch.fill.solid()
    notch.fill.fore_color.rgb = RGBColor(15, 10, 8)
    notch.line.fill.background()

    pad_x = width * 0.04
    pad_y = height * 0.045
    img_w = width - (pad_x * 2)
    img_h = height - (pad_y * 2)
    if os.path.exists(img_path):
        slide.shapes.add_picture(img_path, left + pad_x, top + pad_y, img_w, img_h)

    if caption:
        c_box = slide.shapes.add_textbox(left - Inches(0.3), top + height + Inches(0.04), width + Inches(0.6), Inches(0.28))
        tf = c_box.text_frame
        tf.margin_top = tf.margin_bottom = 0
        p = tf.paragraphs[0]
        p.alignment = PP_ALIGN.CENTER
        p.text = caption
        p.font.name = FONT_BODY
        p.font.size = Pt(8.5)
        p.font.italic = True
        p.font.color.rgb = COLOR_MUTED

def add_placeholder_frame(slide, left, top, width, height, label_text, caption=None):
    frame = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
    frame.fill.solid()
    frame.fill.fore_color.rgb = RGBColor(240, 235, 226)
    frame.line.color.rgb = COLOR_PAPRIKA
    frame.line.width = Pt(1.5)
    
    tf = frame.text_frame
    tf.word_wrap = True
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.CENTER
    p.text = label_text
    p.font.name = FONT_BODY
    p.font.size = Pt(9.5)
    p.font.bold = True
    p.font.color.rgb = COLOR_PAPRIKA

    if caption:
        c_box = slide.shapes.add_textbox(left - Inches(0.2), top + height + Inches(0.04), width + Inches(0.4), Inches(0.28))
        tf_c = c_box.text_frame
        tf_c.margin_top = tf_c.margin_bottom = 0
        p_c = tf_c.paragraphs[0]
        p_c.alignment = PP_ALIGN.CENTER
        p_c.text = caption
        p_c.font.name = FONT_BODY
        p_c.font.size = Pt(8.5)
        p_c.font.italic = True
        p_c.font.color.rgb = COLOR_MUTED

print("Creating 18-Slide CSE279 Presentation Deck...")
# ==============================================================================
# SLIDE 1: TITLE PAGE
# ==============================================================================
s1 = prs.slides.add_slide(blank_layout)
apply_background_and_transition(s1)

# Badge
b1 = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(0.55), Inches(4.2), Inches(0.36))
b1.fill.solid()
b1.fill.fore_color.rgb = COLOR_PAPRIKA
b1.line.fill.background()
tf_b1 = b1.text_frame
tf_b1.vertical_anchor = MSO_ANCHOR.MIDDLE
p_b1 = tf_b1.paragraphs[0]
p_b1.alignment = PP_ALIGN.CENTER
p_b1.text = "CSE279 ARTIFICIAL INTELLIGENCE PROJECT"
p_b1.font.name = FONT_BODY
p_b1.font.size = Pt(10)
p_b1.font.bold = True
p_b1.font.color.rgb = RGBColor(255, 255, 255)

# Main Title & Tagline
t_box1 = s1.shapes.add_textbox(Inches(0.8), Inches(1.05), Inches(6.8), Inches(1.3))
tf_t1 = t_box1.text_frame
tf_t1.word_wrap = True
tf_t1.margin_left = tf_t1.margin_top = 0
p_title1 = tf_t1.paragraphs[0]
p_title1.text = "PantryChef"
p_title1.font.name = FONT_TITLE
p_title1.font.size = Pt(38)
p_title1.font.bold = True
p_title1.font.color.rgb = COLOR_ESPRESSO

p_sub1 = tf_t1.add_paragraph()
p_sub1.text = "Cook with what you already have"
p_sub1.font.name = FONT_BODY
p_sub1.font.size = Pt(16)
p_sub1.font.bold = True
p_sub1.font.color.rgb = COLOR_SAFFRON
p_sub1.space_before = Pt(4)

p_desc1 = tf_t1.add_paragraph()
p_desc1.text = "An Applied Generative AI Progressive Web App for Zero-Waste Cooking"
p_desc1.font.name = FONT_BODY
p_desc1.font.size = Pt(12)
p_desc1.font.color.rgb = COLOR_MUTED
p_desc1.space_before = Pt(4)

# Team Card
card_team = add_card(s1, Inches(0.8), Inches(2.65), Inches(5.8), Inches(3.1), COLOR_CARD_BG, COLOR_BORDER)
tf_team = card_team.text_frame
tf_team.margin_left = Inches(0.25)
tf_team.margin_top = Inches(0.18)

p_th = tf_team.paragraphs[0]
p_th.text = "PROJECT TEAM  •  SUBMITTED BY"
p_th.font.name = FONT_BODY
p_th.font.size = Pt(9.5)
p_th.font.bold = True
p_th.font.color.rgb = COLOR_PAPRIKA

team_rows = [
    ("Deval Yadav", "12521126"),
    ("Amil Muhammad", "12520456"),
    ("Aakash", "12521772"),
    ("Rupesh Kumar", "12522091")
]
for name, reg in team_rows:
    p_row = tf_team.add_paragraph()
    p_row.text = f"•  {name:<22}  Reg. No. {reg}"
    p_row.font.name = FONT_BODY
    p_row.font.size = Pt(11)
    p_row.font.bold = True
    p_row.font.color.rgb = COLOR_ESPRESSO
    p_row.space_before = Pt(4)

# Academic Meta Card
card_meta = add_card(s1, Inches(0.8), Inches(5.95), Inches(5.8), Inches(1.05), COLOR_CARD_TINT, COLOR_BORDER)
tf_meta = card_meta.text_frame
tf_meta.margin_left = Inches(0.25)
tf_meta.margin_top = Inches(0.12)
p_m1 = tf_meta.paragraphs[0]
p_m1.text = "FACULTY GUIDE:  [Guide name]"
p_m1.font.name = FONT_BODY
p_m1.font.size = Pt(9.5)
p_m1.font.bold = True
p_m1.font.color.rgb = COLOR_ESPRESSO

p_m2 = tf_meta.add_paragraph()
p_m2.text = "INSTITUTION:      [College / University]"
p_m2.font.name = FONT_BODY
p_m2.font.size = Pt(9.5)
p_m2.font.color.rgb = COLOR_MUTED
p_m2.space_before = Pt(2)

p_m3 = tf_meta.add_paragraph()
p_m3.text = "SUBMISSION:      [Month Year]  •  Course: CSE279"
p_m3.font.name = FONT_BODY
p_m3.font.size = Pt(9.5)
p_m3.font.color.rgb = COLOR_MUTED
p_m3.space_before = Pt(2)

# Hero Mockups: Laptop + Phone
add_device_laptop(s1, Inches(6.9), Inches(1.15), Inches(5.6), Inches(3.6), "desktop-results.png", "PantryChef desktop interface (demo data)")
add_device_phone(s1, Inches(10.8), Inches(2.7), Inches(1.9), Inches(4.0), "mobile-results.png", "Mobile PWA (emulated)")

set_speaker_notes(s1, """[Click 1] Respected faculty evaluators, good morning. Today, our team—Deval Yadav, Amil Muhammad, Aakash, and Rupesh Kumar—presents PantryChef for CSE279 Artificial Intelligence Project. PantryChef is an applied generative AI progressive web app designed around a daily household dilemma: fridge khola, leftover rice, onion aur paneer pada hai, but we don't know what to cook. Instead of letting food spoil, PantryChef transforms pantry ingredients into three structured, safe recipes via Google Gemini.""")

# ==============================================================================
# SLIDE 2: INTRODUCTION - Background and Motivation
# ==============================================================================
s2 = prs.slides.add_slide(blank_layout)
apply_background_and_transition(s2)
add_header(s2, "INTRODUCTION", "Background & Motivation: The Everyday Kitchen Problem", "Why Applied Generative AI is a Natural Fit for Zero-Waste Home Cooking")

# 3 Concept Cards
prob_items = [
    ("Forgotten Ingredients", "Fresh vegetables, herbs, and staple grains frequently spoil in refrigerator crisper drawers before home cooks figure out how to combine them into appetizing meals.", COLOR_PAPRIKA),
    ("Daily Decision Fatigue", "After exhausting workdays, people face kitchen paralysis staring at odds and ends (e.g. paneer, half an onion, cooked rice), often defaulting to expensive takeout delivery.", COLOR_SAFFRON),
    ("Why Generative AI Fits", "Traditional databases require exact recipe titles. Pre-trained LLMs excel at combinatorial reasoning—synthesizing cohesive meals from arbitrary subsets of ingredients.", COLOR_BASIL)
]
for idx, (title, desc, accent) in enumerate(prob_items):
    c = add_card(s2, Inches(0.8), Inches(1.85 + idx * 1.65), Inches(7.8), Inches(1.45), COLOR_CARD_BG, COLOR_BORDER)
    tf = c.text_frame
    tf.margin_left = Inches(0.3)
    tf.margin_top = Inches(0.18)
    p_t = tf.paragraphs[0]
    p_t.text = f"{idx + 1}.  {title}"
    p_t.font.name = FONT_BODY
    p_t.font.size = Pt(13)
    p_t.font.bold = True
    p_t.font.color.rgb = accent
    
    p_d = tf.add_paragraph()
    p_d.text = desc
    p_d.font.name = FONT_BODY
    p_d.font.size = Pt(10.5)
    p_d.font.color.rgb = COLOR_ESPRESSO
    p_d.space_before = Pt(4)

add_device_phone(s2, Inches(9.2), Inches(1.85), Inches(2.4), Inches(4.8), "mobile-home.png", "Empty pantry input screen (emulated)")

set_speaker_notes(s2, """[Click 1] In every Indian household, we see fresh vegetables and leftover rice sitting in the fridge drawer until they spoil. [Click 2] Home cooks face severe decision fatigue every single evening, wondering 'aaj khane mein kya banayein?' [Click 3] Conventional recipe search portals fail because they expect you to have every specific ingredient listed in their static catalog. [Click 4] Here, a pre-trained generative AI model is the ideal fit: it takes any arbitrary combination of pantry items and creatively synthesizes balanced, delicious recipes.""")

# ==============================================================================
# SLIDE 3: INTRODUCTION - What PantryChef Is
# ==============================================================================
s3 = prs.slides.add_slide(blank_layout)
apply_background_and_transition(s3)
add_header(s3, "INTRODUCTION", "What PantryChef Is: The Four-Step Solution", "Transforming Available Ingredients into Feasts, Saved Favorites, and Shopping Checklists")

# 3 Step Strip Side-by-Side
step_data = [
    ("1. INPUT PANTRY ITEMS", "mobile-home.png", "Add ingredients as keyboard chips with validation (Enter or comma)."),
    ("2. SET FILTERS & PREFERENCES", "mobile-filters.png", "Configure dietary tags (Veg/Vegan), cuisine, time limit & servings."),
    ("3. GENERATE, SAVE & SHOP", "mobile-results.png", "Receive 3 structured recipes; save to favorites & build grocery checklist.")
]
for idx, (title, img_name, desc) in enumerate(step_data):
    left_pos = Inches(0.8 + idx * 3.95)
    c = add_card(s3, left_pos, Inches(1.85), Inches(3.7), Inches(5.1), COLOR_CARD_BG, COLOR_BORDER)
    tf = c.text_frame
    tf.margin_left = tf.margin_right = Inches(0.2)
    tf.margin_top = Inches(0.18)
    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.CENTER
    p.text = title
    p.font.name = FONT_BODY
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = COLOR_PAPRIKA
    
    add_device_phone(s3, left_pos + Inches(0.8), Inches(2.35), Inches(2.1), Inches(3.8), img_name)
    
    p_desc = tf.add_paragraph()
    p_desc.alignment = PP_ALIGN.CENTER
    p_desc.text = desc
    p_desc.font.name = FONT_BODY
    p_desc.font.size = Pt(9.5)
    p_desc.font.color.rgb = COLOR_MUTED
    p_desc.space_before = Pt(175)

set_speaker_notes(s3, """[Click 1] PantryChef streamlines cooking into four intuitive steps. Step one: the user types available ingredients as interactive chips—like paneer, onions, and tomato. [Click 2] Step two: they set filters: vegetarian, under thirty minutes, two servings. [Click 3] Step three: Google Gemini formulates three tailored recipes with clear step-by-step instructions. Step four: users save dishes to favorites and export missing pantry spices directly to an offline shopping list for quick market runs.""")

# ==============================================================================
# SLIDE 4: OBJECTIVE AND SCOPE - Objectives
# ==============================================================================
s4 = prs.slides.add_slide(blank_layout)
apply_background_and_transition(s4)
add_header(s4, "OBJECTIVE AND SCOPE", "Project Objectives: Measurable & Verifiable Goals", "Concrete Benchmarks for Applied Artificial Intelligence and Full-Stack Engineering")

objectives = [
    ("Objective 1: Dynamic Recipe Synthesis", "Generate exactly three distinct, safe culinary recipes from arbitrary user-supplied pantry ingredients and dietary restrictions using an LLM.", COLOR_PAPRIKA),
    ("Objective 2: Server-Side Credential Air-Gap", "Isolate the Gemini API key strictly within the backend Node.js environment, preventing credential leakage to client bundles or browser DevTools.", COLOR_SAFFRON),
    ("Objective 3: Schema Enforcement & Validation", "Enforce strict JSON response schemas via the Gemini API and validate outputs at runtime using Zod, retrying automatically on malformed structures.", COLOR_BASIL),
    ("Objective 4: True Offline Persistence", "Enable full offline retrieval of saved favorites and interactive shopping checklists using device-local IndexedDB storage.", COLOR_ESPRESSO),
    ("Objective 5: Installable PWA Delivery", "Package the frontend as an installable Progressive Web App with service worker asset precaching, fast mobile ergonomics, and touch responsiveness.", COLOR_PAPRIKA)
]

for idx, (title, desc, accent) in enumerate(objectives):
    c = add_card(s4, Inches(0.8), Inches(1.85 + idx * 0.98), Inches(11.733), Inches(0.86), COLOR_CARD_BG, COLOR_BORDER)
    tf = c.text_frame
    tf.margin_left = Inches(0.3)
    tf.margin_top = Inches(0.12)
    p_t = tf.paragraphs[0]
    p_t.text = f"{title}"
    p_t.font.name = FONT_BODY
    p_t.font.size = Pt(12)
    p_t.font.bold = True
    p_t.font.color.rgb = accent
    
    p_d = tf.add_paragraph()
    p_d.text = desc
    p_d.font.name = FONT_BODY
    p_d.font.size = Pt(10)
    p_d.font.color.rgb = COLOR_ESPRESSO
    p_d.space_before = Pt(2)

set_speaker_notes(s4, """[Click 1] We established five verifiable objectives for PantryChef. First, dynamically synthesize three valid recipes respecting arbitrary pantry items. [Click 2] Second, protect credentials by air-gapping the Gemini API key strictly on the Express server. [Click 3] Third, constrain the AI with JSON schemas and Zod validation, retrying on syntax glitches. [Click 4] Fourth, ensure saved recipes and grocery checklists remain accessible completely offline. [Click 5] And fifth, package everything as an installable Progressive Web App.""")

# ==============================================================================
# SLIDE 5: OBJECTIVE AND SCOPE - Scope
# ==============================================================================
s5 = prs.slides.add_slide(blank_layout)
apply_background_and_transition(s5)
add_header(s5, "OBJECTIVE AND SCOPE", "Project Scope: In Scope vs. Out of Scope", "Clear Demarcation of System Capabilities for an Applied AI Capstone")

# In Scope Column
c_in = add_card(s5, Inches(0.8), Inches(1.85), Inches(5.7), Inches(5.1), COLOR_CARD_BG, COLOR_BORDER)
tf_in = c_in.text_frame
tf_in.margin_left = tf_in.margin_right = Inches(0.35)
tf_in.margin_top = Inches(0.25)
p_in = tf_in.paragraphs[0]
p_in.text = "IN SCOPE (DELIVERED WORK)"
p_in.font.name = FONT_BODY
p_in.font.size = Pt(12)
p_in.font.bold = True
p_in.font.color.rgb = COLOR_BASIL

in_bullets = [
    "Generative recipe synthesis using pre-trained Google Gemini via official SDK.",
    "Prompt engineering treating user text as data to neutralize prompt injection.",
    "Strict JSON structured output schema with dual-layer Zod runtime validation.",
    "Single-recipe regeneration allowing users to replace one unwanted suggestion.",
    "Express.js backend gateway with Helmet, rate limiting, and 10KB payload caps.",
    "Offline data persistence for favorites and grocery lists via device IndexedDB.",
    "PWA installability on desktop and mobile browsers with service worker caching."
]
for b in in_bullets:
    p = tf_in.add_paragraph()
    p.text = f"✓  {b}"
    p.font.name = FONT_BODY
    p.font.size = Pt(9.5)
    p.font.color.rgb = COLOR_ESPRESSO
    p.space_before = Pt(6)

# Out of Scope Column
c_out = add_card(s5, Inches(6.8), Inches(1.85), Inches(5.7), Inches(5.1), COLOR_CARD_TINT, COLOR_BORDER)
tf_out = c_out.text_frame
tf_out.margin_left = tf_out.margin_right = Inches(0.35)
tf_out.margin_top = Inches(0.25)
p_out = tf_out.paragraphs[0]
p_out.text = "OUT OF SCOPE (DELIBERATE EXCLUSIONS)"
p_out.font.name = FONT_BODY
p_out.font.size = Pt(12)
p_out.font.bold = True
p_out.font.color.rgb = COLOR_PAPRIKA

out_bullets = [
    "Foundation model training or parameter fine-tuning (pre-trained API used).",
    "Real-time nutritional macro calculations or caloric breakdown computation.",
    "User account authentication systems or remote cloud database synchronisation.",
    "Live grocery market price scraping or supermarket inventory integration.",
    "Computer vision OCR for automated refrigerator shelf scanning (future work).",
    "Hardware kitchen appliance telemetry or IoT smart cooker connectivity."
]
for b in out_bullets:
    p = tf_out.add_paragraph()
    p.text = f"✗  {b}"
    p.font.name = FONT_BODY
    p.font.size = Pt(9.5)
    p.font.color.rgb = COLOR_MUTED
    p.space_before = Pt(7)

set_speaker_notes(s5, """[Click 1] For academic integrity in CSE279, we define our scope clearly. In scope: prompt design, prompt injection defenses, JSON schema enforcement, rate-limited backend security, and offline PWA storage. [Click 2] Out of scope: we did NOT train or fine-tune the foundation model—we consume Gemini as a pre-trained API service. Furthermore, user accounts, caloric analytics, and live supermarket pricing were intentionally omitted to focus on culinary AI pipeline reliability.""")

# ==============================================================================
# SLIDE 6: GAP - Existing Approaches & Gap Analysis
# ==============================================================================
s6 = prs.slides.add_slide(blank_layout)
apply_background_and_transition(s6)
add_header(s6, "GAP", "Existing Approaches & Technical Gap Analysis", "Evaluating Traditional Recipe Portals, Keyword Matchers, and Raw Chatbots")

# Comparison Table
table_shape = s6.shapes.add_table(4, 3, Inches(0.8), Inches(1.85), Inches(11.733), Inches(3.2))
tbl = table_shape.table
tbl.columns[0].width = Inches(2.8)
tbl.columns[1].width = Inches(4.3)
tbl.columns[2].width = Inches(4.633)

headers = ["TYPE OF TOOL", "WHAT IT DOES", "TECHNICAL LIMITATION"]
for col_idx, h in enumerate(headers):
    cell = tbl.cell(0, col_idx)
    cell.fill.solid()
    cell.fill.fore_color.rgb = COLOR_PAPRIKA
    tf = cell.text_frame
    p = tf.paragraphs[0]
    p.text = h
    p.font.name = FONT_BODY
    p.font.size = Pt(10)
    p.font.bold = True
    p.font.color.rgb = RGBColor(255, 255, 255)

rows = [
    ("Traditional Recipe Portals\n(Catalog Search)", "Static relational database query filtered by recipe title or food tag.", "Rigid lookup; fails completely when given unusual combinations of odds and ends; assumes full spice pantry."),
    ("Ingredient-Matching Tools\n(Keyword Intersection)", "Computes set intersections against static recipe archives.", "Requires near-100% catalog recipe match; cannot adapt to small omissions or dietary substitutions gracefully."),
    ("Generic LLM Chatbots\n(Raw Conversational AI)", "Generates unstructured free-text recipes from conversational prompts.", "Unpredictable plain text breaks application UI; leaks API keys if called client-side; offers zero offline storage.")
]

for r_idx, (col0, col1, col2) in enumerate(rows):
    bg_col = COLOR_CARD_BG if r_idx % 2 == 0 else COLOR_CARD_TINT
    for c_idx, val in enumerate([col0, col1, col2]):
        cell = tbl.cell(r_idx + 1, c_idx)
        cell.fill.solid()
        cell.fill.fore_color.rgb = bg_col
        tf = cell.text_frame
        p = tf.paragraphs[0]
        p.text = val
        p.font.name = FONT_BODY
        p.font.size = Pt(9.5)
        p.font.color.rgb = COLOR_ESPRESSO

# Gap Statement Card
c_gap = add_card(s6, Inches(0.8), Inches(5.25), Inches(11.733), Inches(1.7), COLOR_CARD_BG, COLOR_BORDER)
tf_gap = c_gap.text_frame
tf_gap.margin_left = tf_gap.margin_right = Inches(0.3)
tf_gap.margin_top = Inches(0.18)

p_gh = tf_gap.paragraphs[0]
p_gh.text = "THE PANTRYCHEF SOLUTION (BRIDGING THE GAP)"
p_gh.font.name = FONT_BODY
p_gh.font.size = Pt(11)
p_gh.font.bold = True
p_gh.font.color.rgb = COLOR_BASIL

p_gt = tf_gap.add_paragraph()
p_gt.text = "PantryChef bridges this gap by combining generative AI adaptability with strict schema enforcement, server-side API key protection, and offline device storage for saved recipes."
p_gt.font.name = FONT_BODY
p_gt.font.size = Pt(11)
p_gt.font.bold = True
p_gt.font.color.rgb = COLOR_ESPRESSO
p_gt.space_before = Pt(4)

p_ref = tf_gap.add_paragraph()
p_ref.text = "Academic & Industry Literature: [Add 2 to 3 real references]"
p_ref.font.name = FONT_BODY
p_ref.font.size = Pt(9)
p_ref.font.italic = True
p_ref.font.color.rgb = COLOR_MUTED
p_ref.space_before = Pt(4)

set_speaker_notes(s6, """[Click 1] Existing culinary tools fall into three categories. Catalog recipe portals require exact title queries. [Click 2] Ingredient matchers use rigid set intersection and fail when a single ingredient is missing. [Click 3] Raw chatbots provide unstructured text that breaks software UI. [Click 4] PantryChef bridges this gap by combining generative AI adaptability with strict schema enforcement, server-side API key protection, and offline device storage for saved recipes.""")

prs.save(OUTPUT_PPTX)
print("Saved Slides 1-6.")
# ==============================================================================
# SLIDE 7: METHODOLOGY - System Architecture
# ==============================================================================
s7 = prs.slides.add_slide(blank_layout)
apply_background_and_transition(s7)
add_header(s7, "METHODOLOGY", "System Architecture & Secure Data Flow", "Monorepo Architecture with Strict Server-Side AI Credential Air-Gap")

# Architecture Flow Tiers
tiers = [
    ("CLIENT TIER", "PWA Web Shell", ["React 18 + TypeScript", "Tailwind CSS UI", "Vite PWA Plugin", "Service Worker Cache"], COLOR_CARD_BG, COLOR_BORDER),
    ("OFFLINE TIER", "Device Storage", ["IndexedDB (idb-keyval)", "Transparent Fallback", "Persisted Favorites", "Grocery Checklist"], COLOR_CARD_TINT, COLOR_BORDER),
    ("GATEWAY TIER", "Express Server", ["Port 3001 Listener", "Helmet Security Headers", "CORS Allowed Origins", "Rate Limiter (100/15m)"], COLOR_CARD_BG, COLOR_BORDER),
    ("SERVICE TIER", "Recipe Generator", ["Zod Dual Validation", "Prompt Data Isolation", "Error Taxonomy", "Auto-Retry Strategy"], COLOR_CARD_BG, COLOR_BORDER),
    ("AI CLOUD TIER", "Google Gemini API", ["gemini-3.8-flash", "Pre-Trained LLM", "Structured Output Schema", "Culinary Guardrails"], COLOR_CARD_TINT, COLOR_BORDER)
]

for idx, (head, sub, bullets, bg_col, bdr_col) in enumerate(tiers):
    c = add_card(s7, Inches(0.8 + idx * 2.38), Inches(1.85), Inches(2.25), Inches(3.6), bg_col, bdr_col)
    tf = c.text_frame
    tf.margin_left = tf.margin_right = Inches(0.15)
    tf.margin_top = Inches(0.18)
    p_h = tf.paragraphs[0]
    p_h.alignment = PP_ALIGN.CENTER
    p_h.text = head
    p_h.font.name = FONT_BODY
    p_h.font.size = Pt(10)
    p_h.font.bold = True
    p_h.font.color.rgb = COLOR_PAPRIKA
    
    p_s = tf.add_paragraph()
    p_s.alignment = PP_ALIGN.CENTER
    p_s.text = sub
    p_s.font.name = FONT_BODY
    p_s.font.size = Pt(8.5)
    p_s.font.bold = True
    p_s.font.color.rgb = COLOR_ESPRESSO
    p_s.space_before = Pt(2)
    
    for b in bullets:
        p_b = tf.add_paragraph()
        p_b.text = f"• {b}"
        p_b.font.name = FONT_BODY
        p_b.font.size = Pt(8)
        p_b.font.color.rgb = COLOR_MUTED
        p_b.space_before = Pt(3)

# Highlight Key Air-Gap Banner
c_airgap = add_card(s7, Inches(0.8), Inches(5.65), Inches(11.733), Inches(1.3), COLOR_CARD_BG, COLOR_PAPRIKA)
tf_ag = c_airgap.text_frame
tf_ag.margin_left = tf_ag.margin_right = Inches(0.3)
tf_ag.margin_top = Inches(0.15)

p_ah = tf_ag.paragraphs[0]
p_ah.text = "CRITICAL SECURITY ARCHITECTURE: GEMINI KEY STAYS ON SERVER"
p_ah.font.name = FONT_BODY
p_ah.font.size = Pt(11)
p_ah.font.bold = True
p_ah.font.color.rgb = COLOR_PAPRIKA

p_at = tf_ag.add_paragraph()
p_at.text = "The browser never executes Gemini API calls directly. GEMINI_API_KEY is read at request time strictly from server environment variables (.env). Zero client bundle leakage, no exposure in DevTools network panels, and no secret check violations."
p_at.font.name = FONT_BODY
p_at.font.size = Pt(9.5)
p_at.font.color.rgb = COLOR_ESPRESSO
p_at.space_before = Pt(3)

set_speaker_notes(s7, """[Click 1] Our system architecture divides responsibilities cleanly across five tiers. [Click 2] The React client handles the UI, while local IndexedDB guarantees instant offline recipe access. [Click 3] The Express gateway provides rate limiting, Helmet headers, and CORS restrictions. [Click 4] The service layer handles prompt construction and Zod schema parsing. [Click 5] Crucially, the Gemini API key stays strictly on the server—never in client code.
Viva Q: Why not call Gemini directly from React?
Viva A: Calling LLMs client-side leaks your API key in browser network tabs, exposing your account to unauthorized usage and quota exhaustion.""")

# ==============================================================================
# SLIDE 8: METHODOLOGY - AI Approach
# ==============================================================================
s8 = prs.slides.add_slide(blank_layout)
apply_background_and_transition(s8)
add_header(s8, "METHODOLOGY", "Applied AI Approach & Prompt Architecture", "Prompt Isolation, Structured JSON Schemas, Zod Validation, and Safety Guardrails")

# Pipeline Flow Diagram (6 Connected Stages)
stages = [
    ("1. USER INPUTS", "Raw ingredient chips, diets, time & servings constraints."),
    ("2. PROMPT BUILDER", "System instructions isolate culinary role; user inputs passed strictly as data."),
    ("3. GEMINI API CALL", "Pre-trained foundation model receives prompt with strict JSON schema."),
    ("4. SCHEMA VALIDATION", "Runtime Zod validation checks fields (id, title, steps, haveIt tags)."),
    ("5. RETRY OR ERROR", "Automatic single retry on format failure; friendly error codes on API drop."),
    ("6. RECIPE CARDS", "Deterministic output populated into responsive, interactive UI cards.")
]

for idx, (title, desc) in enumerate(stages):
    c = add_card(s8, Inches(0.8 + idx * 1.98), Inches(1.85), Inches(1.85), Inches(2.2), COLOR_CARD_BG, COLOR_BORDER)
    tf = c.text_frame
    tf.margin_left = tf.margin_right = Inches(0.12)
    tf.margin_top = Inches(0.14)
    p_h = tf.paragraphs[0]
    p_h.alignment = PP_ALIGN.CENTER
    p_h.text = title
    p_h.font.name = FONT_BODY
    p_h.font.size = Pt(9)
    p_h.font.bold = True
    p_h.font.color.rgb = COLOR_PAPRIKA
    
    p_d = tf.add_paragraph()
    p_d.alignment = PP_ALIGN.CENTER
    p_d.text = desc
    p_d.font.name = FONT_BODY
    p_d.font.size = Pt(7.5)
    p_d.font.color.rgb = COLOR_ESPRESSO
    p_d.space_before = Pt(4)

# Technical AI Methodology Cards
c_prompt = add_card(s8, Inches(0.8), Inches(4.25), Inches(5.7), Inches(2.7), COLOR_CARD_BG, COLOR_BORDER)
tf_pr = c_prompt.text_frame
tf_pr.margin_left = tf_pr.margin_right = Inches(0.25)
tf_pr.margin_top = Inches(0.18)
p_prh = tf_pr.paragraphs[0]
p_prh.text = "PROMPT DESIGN & INJECTION DEFENSE"
p_prh.font.name = FONT_BODY
p_prh.font.size = Pt(11)
p_prh.font.bold = True
p_prh.font.color.rgb = COLOR_SAFFRON

pr_bullets = [
    "System Instruction: 'You are PantryChef, an expert culinary assistant and food safety specialist.'",
    "Data Isolation: User ingredients are sanitized and enclosed in JSON arrays, neutralizing override attempts.",
    "Categorization: Model explicitly sets haveIt: true for pantry items and false for missing staples.",
    "Clear Sequential Steps: Instructions require numbered, beginner-friendly cooking steps."
]
for b in pr_bullets:
    p = tf_pr.add_paragraph()
    p.text = f"• {b}"
    p.font.name = FONT_BODY
    p.font.size = Pt(8.5)
    p.font.color.rgb = COLOR_ESPRESSO
    p.space_before = Pt(3)

c_safety = add_card(s8, Inches(6.8), Inches(4.25), Inches(5.7), Inches(2.7), COLOR_CARD_TINT, COLOR_BORDER)
tf_sf = c_safety.text_frame
tf_sf.margin_left = tf_sf.margin_right = Inches(0.25)
tf_sf.margin_top = Inches(0.18)
p_sfh = tf_sf.paragraphs[0]
p_sfh.text = "SAFETY, ALLERGENS & OUTPUT ACCURACY"
p_sfh.font.name = FONT_BODY
p_sfh.font.size = Pt(11)
p_sfh.font.bold = True
p_sfh.font.color.rgb = COLOR_BASIL

sf_bullets = [
    "Strict Dietary Compliance: Vegetarian, Vegan, Gluten-Free filters enforced through hard system rules.",
    "Food Safety Guardrails: Prompt strictly forbids unsafe food advice or hazardous cooking temps.",
    "Dual Validation with Retry: Automatically re-queries Gemini once if JSON structure fails Zod schema.",
    "Allergen Disclaimer: UI explicitly alerts users to verify AI suggestions against real kitchen allergies."
]
for b in sf_bullets:
    p = tf_sf.add_paragraph()
    p.text = f"• {b}"
    p.font.name = FONT_BODY
    p.font.size = Pt(8.5)
    p.font.color.rgb = COLOR_ESPRESSO
    p.space_before = Pt(3)

set_speaker_notes(s8, """[Click 1] As an applied AI project, our core engineering lies in the pipeline. User inputs enter a prompt builder. [Click 2] We enforce system instructions where ingredients are treated purely as raw data to neutralize prompt injection. [Click 3] Gemini generates responses governed by a structured JSON schema. [Click 4] Next, Zod runtime validation inspects the output. [Click 5] If malformed, it retries once before surfacing friendly errors. [Click 6] Finally, verified recipes render into cards.
Viva Q: What is your AI contribution if Gemini was pre-trained?
Viva A: Our contribution is robust pipeline engineering: prompt security, JSON schema enforcement, runtime validation with auto-retry, and allergen safety guardrails.""")

# ==============================================================================
# SLIDE 9: METHODOLOGY - Implementation
# ==============================================================================
s9 = prs.slides.add_slide(blank_layout)
apply_background_and_transition(s9)
add_header(s9, "METHODOLOGY", "Implementation: Tech Stack & API Contract", "Production-Grade Engineering Tooling, REST Endpoints, and Defense-in-Depth")

# Tech Stack Table
t_stack = s9.shapes.add_table(7, 2, Inches(0.8), Inches(1.85), Inches(5.7), Inches(5.1))
tbl_s = t_stack.table
tbl_s.columns[0].width = Inches(2.2)
tbl_s.columns[1].width = Inches(3.5)

stack_rows = [
    ("TECHNOLOGY", "ARCHITECTURAL RATIONALE"),
    ("React 18 + Vite", "High-speed SPA bundling, fast refresh, and native PWA plugin integration."),
    ("TypeScript 5", "Full-stack end-to-end static typing; shared schemas between server & client."),
    ("Tailwind CSS", "Utility-first design tokens with high-contrast, accessible mobile tap targets."),
    ("Node 20 + Express", "Lightweight backend proxy air-gapping credentials with Helmet security."),
    ("@google/genai SDK", "Official Google SDK enforcing structured JSON response schemas at API level."),
    ("IndexedDB + idb-keyval", "Asynchronous device storage providing zero-login offline recipe persistence.")
]

for r_idx, (col0, col1) in enumerate(stack_rows):
    bg_col = COLOR_PAPRIKA if r_idx == 0 else (COLOR_CARD_BG if r_idx % 2 == 1 else COLOR_CARD_TINT)
    fg_col = RGBColor(255, 255, 255) if r_idx == 0 else COLOR_ESPRESSO
    for c_idx, val in enumerate([col0, col1]):
        cell = tbl_s.cell(r_idx, c_idx)
        cell.fill.solid()
        cell.fill.fore_color.rgb = bg_col
        tf = cell.text_frame
        p = tf.paragraphs[0]
        p.text = val
        p.font.name = FONT_BODY
        p.font.size = Pt(8.5) if r_idx > 0 else Pt(9)
        p.font.bold = (r_idx == 0 or c_idx == 0)
        p.font.color.rgb = fg_col

# Right Column: Endpoints & Error Taxonomy
c_api = add_card(s9, Inches(6.8), Inches(1.85), Inches(5.7), Inches(5.1), COLOR_CARD_BG, COLOR_BORDER)
tf_api = c_api.text_frame
tf_api.margin_left = tf_api.margin_right = Inches(0.3)
tf_api.margin_top = Inches(0.2)

p_apih = tf_api.paragraphs[0]
p_apih.text = "API CONTRACT & ERROR TAXONOMY"
p_apih.font.name = FONT_BODY
p_apih.font.size = Pt(11)
p_apih.font.bold = True
p_apih.font.color.rgb = COLOR_PAPRIKA

endpoints_info = [
    ("GET /api/health", "200: { ok: true, geminiConfigured: boolean } - Never returns key."),
    ("POST /api/recipes", "200: { recipes: Recipe[3] } - 10KB body limit, max 30 ingredients."),
    ("POST /api/recipes/regenerate", "200: { recipe: Recipe } - Replaces single title without repeating.")
]
for ep, desc in endpoints_info:
    p = tf_api.add_paragraph()
    p.text = f"• {ep}\n   {desc}"
    p.font.name = FONT_BODY
    p.font.size = Pt(8.5)
    p.font.color.rgb = COLOR_ESPRESSO
    p.space_before = Pt(4)

p_errh = tf_api.add_paragraph()
p_errh.text = "Standardized Error Codes ({ error: { code, message } }):"
p_errh.font.name = FONT_BODY
p_errh.font.size = Pt(9.5)
p_errh.font.bold = True
p_errh.font.color.rgb = COLOR_SAFFRON
p_errh.space_before = Pt(8)

errors_info = [
    ("503 GEMINI_KEY_MISSING", "Key missing in server environment; app still boots."),
    ("400 INVALID_REQUEST", "Failed Zod validation (ingredient length, serving bounds)."),
    ("429 RATE_LIMITED", "Exceeded request threshold (express-rate-limit)."),
    ("502 GEMINI_UNAVAILABLE", "Gemini service unreachable or upstream network drop."),
    ("502 GEMINI_BAD_RESPONSE", "Model output failed schema validation after retry."),
    ("504 TIMEOUT", "AI generation exceeded server timeout window (25s).")
]
for code, desc in errors_info:
    p = tf_api.add_paragraph()
    p.text = f"  [{code}]: {desc}"
    p.font.name = FONT_BODY
    p.font.size = Pt(8)
    p.font.color.rgb = COLOR_MUTED
    p.space_before = Pt(2)

set_speaker_notes(s9, """[Click 1] On the implementation side, we selected modern, production-grade tooling: React 18 and Vite for snappy UI rendering, TypeScript for end-to-end schema safety, and Tailwind CSS for mobile ergonomics. [Click 2] Our Express API contract strictly validates payloads using Zod with a 10KB cap and 30-item limit. [Click 3] Every error adheres to a predictable six-code taxonomy, keeping the UI friendly and secure.
Viva Q: How does rate limiting protect the application?
Viva A: Express-rate-limit restricts requests to recipe endpoints to prevent automated abuse, denial of service, and rapid quota exhaustion.""")

# ==============================================================================
# SLIDE 10: METHODOLOGY - UI/UX and PWA
# ==============================================================================
s10 = prs.slides.add_slide(blank_layout)
apply_background_and_transition(s10)
add_header(s10, "METHODOLOGY", "UI/UX Design Tokens & PWA Architecture", "Food-Inspired Identity, Mobile-First Ergonomics, and True Offline Resilience")

# Left Column: Palette & Tokens
c_ux = add_card(s10, Inches(0.8), Inches(1.85), Inches(4.8), Inches(5.1), COLOR_CARD_BG, COLOR_BORDER)
tf_ux = c_ux.text_frame
tf_ux.margin_left = tf_ux.margin_right = Inches(0.25)
tf_ux.margin_top = Inches(0.2)
p_uxh = tf_ux.paragraphs[0]
p_uxh.text = "DESIGN TOKENS & ACCESSIBILITY"
p_uxh.font.name = FONT_BODY
p_uxh.font.size = Pt(11)
p_uxh.font.bold = True
p_uxh.font.color.rgb = COLOR_PAPRIKA

ux_points = [
    ("Food-Inspired Palette", "Paprika Red (#CE3E22), Saffron Gold (#C97A00), Basil Green (#2D6A4F), Warm Cream (#FAF7F2), Espresso (#1E1510)."),
    ("Typography & Contrast", "Georgia serif headers paired with clean Calibri sans body; WCAG AA contrast compliance across all text."),
    ("Touch Ergonomics", "44px minimum tap target sizes on interactive chips, steppers, and navigation icons for greasy kitchen fingers."),
    ("Offline-First Storage", "Favorites and shopping lists persist locally via IndexedDB with automatic localStorage fallback.")
]
for title, desc in ux_points:
    p = tf_ux.add_paragraph()
    p.text = f"• {title}:\n   {desc}"
    p.font.name = FONT_BODY
    p.font.size = Pt(8.5)
    p.font.color.rgb = COLOR_ESPRESSO
    p.space_before = Pt(5)

# Middle: Responsive Side-by-Side
add_device_laptop(s10, Inches(5.8), Inches(1.85), Inches(3.6), Inches(2.4), "desktop-home.png", "Desktop home view")
add_device_phone(s10, Inches(5.8), Inches(4.45), Inches(1.6), Inches(2.5), "mobile-home.png", "Mobile home (emulated)")

# Right: PWA Offline & Phone Placeholders
add_device_phone(s10, Inches(7.7), Inches(4.45), Inches(1.6), Inches(2.5), "mobile-offline.png", "Offline favorites (emulated)")
add_placeholder_frame(s10, Inches(9.6), Inches(1.85), Inches(2.8), Inches(2.4), "[Insert photo: phone-install.png\nApp icon on real phone screen]", "Physical phone install (placeholder)")
add_placeholder_frame(s10, Inches(9.6), Inches(4.55), Inches(2.8), Inches(2.4), "[Insert photo: phone-standalone.png\nApp in standalone display mode]", "Physical standalone view (placeholder)")

set_speaker_notes(s10, """[Click 1] Kitchen software demands distinct ergonomics. We created a warm food-inspired palette using Paprika, Saffron, and Basil green with high contrast. [Click 2] All buttons and chips enforce a 44-pixel minimum tap target so users can easily tap them while cooking. [Click 3] Notice the responsive layout: on desktop, it spans a multi-column view, while on mobile, it organizes into compact cards. [Click 4] Through vite-plugin-pwa, the service worker precaches application assets so saved favorites open even when Wi-Fi drops completely.""")

# ==============================================================================
# SLIDE 11: RESULTS - Working Application
# ==============================================================================
s11 = prs.slides.add_slide(blank_layout)
apply_background_and_transition(s11)
add_header(s11, "RESULTS", "Working Application: 5-Step Storyboard", "Verified Walkthrough from Empty Pantry to Generated Meals and Grocery Checklist")

story_steps = [
    ("Step 1: Add Chips", "mobile-home.png", "Type ingredients (rice, onion, paneer); chips appear instantly."),
    ("Step 2: Set Filters", "mobile-filters.png", "Select Vegetarian, 30 min limit, Indian cuisine & 2 servings."),
    ("Step 3: AI Generation", "mobile-results.png", "Receive 3 structured recipes: Paneer Bhurji, Fried Rice & Curry."),
    ("Step 4: Save Favorite", "mobile-favorites.png", "Save favorite dishes to local device storage with one tap."),
    ("Step 5: Grocery List", "mobile-shopping.png", "Add missing ingredients to shopping list with strike-through checks.")
]

for idx, (title, img_name, desc) in enumerate(story_steps):
    c_left = Inches(0.8 + idx * 2.38)
    c = add_card(s11, c_left, Inches(1.85), Inches(2.25), Inches(5.1), COLOR_CARD_BG, COLOR_BORDER)
    tf = c.text_frame
    tf.margin_left = tf.margin_right = Inches(0.12)
    tf.margin_top = Inches(0.15)
    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.CENTER
    p.text = title
    p.font.name = FONT_BODY
    p.font.size = Pt(10)
    p.font.bold = True
    p.font.color.rgb = COLOR_PAPRIKA
    
    add_device_phone(s11, c_left + Inches(0.35), Inches(2.35), Inches(1.55), Inches(2.8), img_name)
        
    p_desc = tf.add_paragraph()
    p_desc.alignment = PP_ALIGN.CENTER
    p_desc.text = desc
    p_desc.font.name = FONT_BODY
    p_desc.font.size = Pt(8)
    p_desc.font.color.rgb = COLOR_MUTED
    p_desc.space_before = Pt(170)

set_speaker_notes(s11, """[Click 1] Here is the working application storyboard. Step one: the user types three ingredients into the input bar. [Click 2] Step two: they set filters—Vegetarian, 30 minutes, 2 servings. [Click 3] Step three: Gemini generates three distinct dishes, like Paneer Bhurji and Quick Fried Rice, marking which items are on hand. [Click 4] Step four: the user saves their favorite dish to local storage. [Click 5] Step five: missing items automatically export to an interactive offline grocery checklist.""")

# ==============================================================================
# SLIDE 12: RESULTS - Testing and Validation
# ==============================================================================
s12 = prs.slides.add_slide(blank_layout)
apply_background_and_transition(s12)
add_header(s12, "RESULTS", "System Testing, Verification & Secrets Audit", "Empirical Test Results, Key Security Scans, and AI Output Evaluation Framework")

# Left Column: Real Test Results & Evaluation Box
c_test = add_card(s12, Inches(0.8), Inches(1.85), Inches(5.8), Inches(5.1), COLOR_CARD_BG, COLOR_BORDER)
tf_tst = c_test.text_frame
tf_tst.margin_left = tf_tst.margin_right = Inches(0.3)
tf_tst.margin_top = Inches(0.2)

p_th = tf_tst.paragraphs[0]
p_th.text = "EMPIRICAL AUTOMATED TEST RESULTS"
p_th.font.name = FONT_BODY
p_th.font.size = Pt(11)
p_th.font.bold = True
p_th.font.color.rgb = COLOR_BASIL

test_metrics = [
    ("Backend Test Suite (Vitest + Supertest)", "15 / 15 PASSED (100%)", "Payload bounds, Zod rejections, 10KB caps, 6-code error mapping, unique titles."),
    ("Frontend Test Suite (Vitest + JSDOM)", "16 / 16 PASSED (100%)", "Chip entry/removal, keyboard events, storage corruption recovery, shopping deduplication."),
    ("Security Secrets Audit (check-secrets.mjs)", "99 FILES SCANNED  •  0 LEAKS", "Scanned all sources & client bundles; verified 0 AIza keys and 0 GEMINI_API_KEY tokens in client.")
]
for title, score, details in test_metrics:
    p = tf_tst.add_paragraph()
    p.text = f"• {title}\n   Result: {score}\n   Scope: {details}"
    p.font.name = FONT_BODY
    p.font.size = Pt(8.5)
    p.font.color.rgb = COLOR_ESPRESSO
    p.space_before = Pt(4)

p_evh = tf_tst.add_paragraph()
p_evh.text = "AI OUTPUT QUALITY & CONSTRAINT EVALUATION"
p_evh.font.name = FONT_BODY
p_evh.font.size = Pt(10.5)
p_evh.font.bold = True
p_evh.font.color.rgb = COLOR_PAPRIKA
p_evh.space_before = Pt(8)

p_eval = tf_tst.add_paragraph()
p_eval.text = "[Insert evaluation: number of test inputs, and how many responses followed the diet, time and servings filters]\nNote: Fill only if measured with live Gemini API key; never invent unverified evaluation metrics."
p_eval.font.name = FONT_BODY
p_eval.font.size = Pt(8.5)
p_eval.font.italic = True
p_eval.font.color.rgb = COLOR_MUTED
p_eval.space_before = Pt(2)

# Right Column: Terminal Capture & Error Capture
add_device_laptop(s12, Inches(6.9), Inches(1.85), Inches(5.6), Inches(2.6), "tests.png", "Terminal capture: Passing Vitest suites & 0-leak secret scan")
add_device_phone(s12, Inches(8.5), Inches(4.7), Inches(2.4), Inches(2.2), "mobile-error.png", "Friendly 503 error handling (emulated)")

set_speaker_notes(s12, """[Click 1] System verification was conducted using automated testing suites. Our backend suite executed 15 tests covering payload limits, Zod validation, and error taxonomy mapping. [Click 2] The frontend suite executed 16 tests verifying chip keyboard handling, deduplication, and storage corruption recovery—giving 31 out of 31 passed tests. [Click 3] Our custom secrets scanner audited 99 repository files, confirming zero leaked keys. [Click 4] On the AI output evaluation box, we leave room for live test run numbers.""")

prs.save(OUTPUT_PPTX)
print("Saved Slides 7-12.")
# ==============================================================================
# SLIDE 13: CONCLUSION AND FUTURE WORK - Conclusion
# ==============================================================================
s13 = prs.slides.add_slide(blank_layout)
apply_background_and_transition(s13)
add_header(s13, "CONCLUSION AND FUTURE WORK", "Project Conclusion & Objective Evaluation", "Verified Deliverables, Critical Limitations, and Applied AI Learnings")

# Objective Achievement Table
t_achieve = s13.shapes.add_table(6, 3, Inches(0.8), Inches(1.85), Inches(6.0), Inches(5.1))
tbl_a = t_achieve.table
tbl_a.columns[0].width = Inches(2.3)
tbl_a.columns[1].width = Inches(2.7)
tbl_a.columns[2].width = Inches(1.0)

achieve_rows = [
    ("OBJECTIVE (SLIDE 4)", "VERIFIED DELIVERABLE", "STATUS"),
    ("1. Dynamic Synthesis", "Generates 3 distinct recipes respecting diets and time limit.", "ACHIEVED"),
    ("2. Server Key Isolation", "Key stored in server .env; 0 client bundle leaks across 99 files.", "ACHIEVED"),
    ("3. Schema Enforcement", "Dual Zod validation with automatic retry on malformed JSON.", "ACHIEVED"),
    ("4. Offline Persistence", "Favorites & shopping list persist via IndexedDB without Wi-Fi.", "ACHIEVED"),
    ("5. PWA Installability", "Service worker precaching, manifest, and home screen install flow.", "ACHIEVED")
]

for r_idx, (col0, col1, col2) in enumerate(achieve_rows):
    bg_col = COLOR_PAPRIKA if r_idx == 0 else (COLOR_CARD_BG if r_idx % 2 == 1 else COLOR_CARD_TINT)
    fg_col = RGBColor(255, 255, 255) if r_idx == 0 else COLOR_ESPRESSO
    for c_idx, val in enumerate([col0, col1, col2]):
        cell = tbl_a.cell(r_idx, c_idx)
        cell.fill.solid()
        cell.fill.fore_color.rgb = bg_col
        tf = cell.text_frame
        p = tf.paragraphs[0]
        p.text = val
        p.font.name = FONT_BODY
        p.font.size = Pt(8) if r_idx > 0 else Pt(8.5)
        p.font.bold = (r_idx == 0 or c_idx == 2)
        if c_idx == 2 and r_idx > 0:
            p.alignment = PP_ALIGN.CENTER
            p.font.color.rgb = COLOR_BASIL
        else:
            p.font.color.rgb = fg_col

# Right Column: Honest Limitations & Learning Outcomes
c_lim = add_card(s13, Inches(7.1), Inches(1.85), Inches(5.4), Inches(2.45), COLOR_CARD_BG, COLOR_BORDER)
tf_lim = c_lim.text_frame
tf_lim.margin_left = tf_lim.margin_right = Inches(0.25)
tf_lim.margin_top = Inches(0.18)
p_lh = tf_lim.paragraphs[0]
p_lh.text = "HONEST TECHNICAL LIMITATIONS"
p_lh.font.name = FONT_BODY
p_lh.font.size = Pt(11)
p_lh.font.bold = True
p_lh.font.color.rgb = COLOR_PAPRIKA

lim_bullets = [
    "AI Accuracy & Hallucinations: LLMs may produce unconventional ingredient pairings or misjudge cooking times slightly.",
    "Critical Allergen Risk: Users must personally verify ingredients for severe peanut/gluten allergies before consumption.",
    "Network Dependency: While saved favorites are offline, generating new recipes strictly requires an active internet connection."
]
for b in lim_bullets:
    p = tf_lim.add_paragraph()
    p.text = f"• {b}"
    p.font.name = FONT_BODY
    p.font.size = Pt(8.5)
    p.font.color.rgb = COLOR_ESPRESSO
    p.space_before = Pt(3)

c_lrn = add_card(s13, Inches(7.1), Inches(4.5), Inches(5.4), Inches(2.45), COLOR_CARD_TINT, COLOR_BORDER)
tf_lrn = c_lrn.text_frame
tf_lrn.margin_left = tf_lrn.margin_right = Inches(0.25)
tf_lrn.margin_top = Inches(0.18)
p_lrh = tf_lrn.paragraphs[0]
p_lrh.text = "CORE ENGINEERING & AI LEARNINGS"
p_lrh.font.name = FONT_BODY
p_lrh.font.size = Pt(11)
p_lrh.font.bold = True
p_lrh.font.color.rgb = COLOR_BASIL

lrn_bullets = [
    "Prompt Injection Resilience: Passing user inputs as raw JSON arrays prevents prompt override attempts reliably.",
    "Schema-First AI Architecture: Enforcing response schemas converts unpredictable text models into robust UI APIs.",
    "Offline-First Web Synergy: Combining Service Workers with IndexedDB delivers native-app responsiveness on the web."
]
for b in lrn_bullets:
    p = tf_lrn.add_paragraph()
    p.text = f"• {b}"
    p.font.name = FONT_BODY
    p.font.size = Pt(8.5)
    p.font.color.rgb = COLOR_ESPRESSO
    p.space_before = Pt(3)

set_speaker_notes(s13, """[Click 1] In conclusion, PantryChef successfully achieved all five engineering objectives established on slide 4, backed by 31 passing unit tests. [Click 2] We maintain complete transparency regarding limitations: foundation models can hallucinate cooking times, allergens must be personally verified by home cooks, and generating new recipes requires internet connectivity. [Click 3] Our major learning outcome was mastering prompt security and structured JSON validation, proving that pre-trained LLMs can be integrated into dependable software.""")

# ==============================================================================
# SLIDE 14: CONCLUSION AND FUTURE WORK - Future Work
# ==============================================================================
s14 = prs.slides.add_slide(blank_layout)
apply_background_and_transition(s14)
add_header(s14, "CONCLUSION AND FUTURE WORK", "Future Research & Applied AI Roadmap", "Extending PantryChef from Functional Prototype to Intelligent Culinary Ecosystem")

roadmap_cards = [
    ("Phase 1: Multimodal Vision OCR", "Incorporate Gemini Vision to enable home cooks to snap a single photograph of their refrigerator shelves, automatically populating ingredient chips without manual typing.", COLOR_PAPRIKA),
    ("Phase 2: Nutritional & Macro Analytics", "Integrate verified USDA food composition APIs to compute precise caloric breakdowns, protein macros, and glycemic estimates for generated recipes.", COLOR_SAFFRON),
    ("Phase 3: Multi-Device Cloud Sync", "Introduce optional end-to-end encrypted user accounts allowing family members to synchronize weekly meal plans and shopping checklists across devices.", COLOR_BASIL),
    ("Phase 4: Quantitative Evaluation Benchmark", "Build an automated evaluation framework testing 1,000 pantry combinations against strict dietary constraints, measuring exact hallucination rates and safety compliance.", COLOR_ESPRESSO)
]

for idx, (title, desc, accent) in enumerate(roadmap_cards):
    c = add_card(s14, Inches(0.8), Inches(1.85 + idx * 1.25), Inches(11.733), Inches(1.1), COLOR_CARD_BG, COLOR_BORDER)
    tf = c.text_frame
    tf.margin_left = Inches(0.3)
    tf.margin_top = Inches(0.16)
    p_t = tf.paragraphs[0]
    p_t.text = f"{title}"
    p_t.font.name = FONT_BODY
    p_t.font.size = Pt(12)
    p_t.font.bold = True
    p_t.font.color.rgb = accent
    
    p_d = tf.add_paragraph()
    p_d.text = desc
    p_d.font.name = FONT_BODY
    p_d.font.size = Pt(9.5)
    p_d.font.color.rgb = COLOR_ESPRESSO
    p_d.space_before = Pt(3)

set_speaker_notes(s14, """[Click 1] Looking forward, our roadmap prioritizes four technical enhancements. Phase one introduces multimodal refrigerator scanning so users can snap a photo of their fridge instead of typing. [Click 2] Phase two links USDA nutritional databases for caloric and macro breakdown. [Click 3] Phase three introduces optional multi-device account sync. [Click 4] And phase four establishes an automated benchmark suite testing model adherence across one thousand synthetic pantry configurations.""")

# ==============================================================================
# SLIDE 15: CONCLUSION AND FUTURE WORK - Thank You / Questions
# ==============================================================================
s15 = prs.slides.add_slide(blank_layout)
apply_background_and_transition(s15)
add_header(s15, "CONCLUSION AND FUTURE WORK", "Thank You & Evaluator Q&A", "Course: CSE279 Artificial Intelligence Project  •  PantryChef Capstone")

# Big Thank You Card
c_ty = add_card(s15, Inches(0.8), Inches(1.85), Inches(11.733), Inches(5.1), COLOR_CARD_BG, COLOR_BORDER)
tf_ty = c_ty.text_frame
tf_ty.margin_left = tf_ty.margin_right = Inches(0.5)
tf_ty.margin_top = Inches(0.4)

p_th1 = tf_ty.paragraphs[0]
p_th1.alignment = PP_ALIGN.CENTER
p_th1.text = "Thank You for Your Time & Evaluation!"
p_th1.font.name = FONT_TITLE
p_th1.font.size = Pt(32)
p_th1.font.bold = True
p_th1.font.color.rgb = COLOR_PAPRIKA

p_th2 = tf_ty.add_paragraph()
p_th2.alignment = PP_ALIGN.CENTER
p_th2.text = "PantryChef is ready for live demonstration and faculty examination."
p_th2.font.name = FONT_BODY
p_th2.font.size = Pt(14)
p_th2.font.color.rgb = COLOR_ESPRESSO
p_th2.space_before = Pt(8)

p_th3 = tf_ty.add_paragraph()
p_th3.alignment = PP_ALIGN.CENTER
p_th3.text = "PROJECT TEAM MEMBERS"
p_th3.font.name = FONT_BODY
p_th3.font.size = Pt(12)
p_th3.font.bold = True
p_th3.font.color.rgb = COLOR_SAFFRON
p_th3.space_before = Pt(24)

# 4 Team Members side by side
team_simple = ["Deval Yadav", "Amil Muhammad", "Aakash", "Rupesh Kumar"]
p_th4 = tf_ty.add_paragraph()
p_th4.alignment = PP_ALIGN.CENTER
p_th4.text = "       •       ".join(team_simple)
p_th4.font.name = FONT_BODY
p_th4.font.size = Pt(13)
p_th4.font.bold = True
p_th4.font.color.rgb = COLOR_ESPRESSO
p_th4.space_before = Pt(8)

p_th5 = tf_ty.add_paragraph()
p_th5.alignment = PP_ALIGN.CENTER
p_th5.text = "We are now open for faculty questions, architecture defense, and live software walkthrough."
p_th5.font.name = FONT_BODY
p_th5.font.size = Pt(11)
p_th5.font.italic = True
p_th5.font.color.rgb = COLOR_MUTED
p_th5.space_before = Pt(24)

set_speaker_notes(s15, """[Click 1] On behalf of Deval Yadav, Amil Muhammad, Aakash, and Rupesh Kumar, we sincerely thank our faculty guide and evaluators for their mentorship throughout this artificial intelligence capstone. PantryChef proves that thoughtful applied AI engineering can transform everyday kitchen leftovers into delicious meals while maintaining strict security and offline resilience. We welcome your questions and feedback.""")

# ==============================================================================
# SLIDE 16: APPENDIX A - Viva Q&A
# ==============================================================================
s16 = prs.slides.add_slide(blank_layout)
apply_background_and_transition(s16)
add_header(s16, "APPENDIX A", "Faculty Viva Defense: Ten Core Technical Questions", "Comprehensive Reference for Architecture, Security, Applied AI, and Reliability")

qas_left = [
    ("Q1: Why use an Express backend proxy instead of calling Gemini directly from React?", "A1: Direct browser API calls expose your API key in JavaScript bundles and network tabs. The backend proxy air-gaps credentials, enforces rate limits, and validates request bodies."),
    ("Q2: Why build a Progressive Web App instead of a native mobile app?", "A2: PWAs offer zero-install overhead, instant URL sharing, cross-platform compatibility, and full offline caching via service workers without app store approval friction."),
    ("Q3: What role does the Service Worker play in PantryChef?", "A3: The service worker precaches application shell assets (HTML, CSS, JS, icons), allowing the UI, saved recipes, and grocery checklist to render instantly even when offline."),
    ("Q4: How does the application protect against prompt injection in ingredients?", "A4: User ingredient text is sanitized, bounded to 40 characters, and passed strictly as raw JSON data inside an isolated system instruction that treats input as data, not commands."),
    ("Q5: How does the server guarantee structured JSON output from Gemini?", "A5: The @google/genai SDK passes a native JSON response schema. The backend then validates the response via Zod, retrying once automatically on format failure.")
]

qas_right = [
    ("Q6: What is the team's applied AI contribution if a pre-trained model was used?", "A6: Our contribution is robust pipeline engineering: prompt security, JSON schema enforcement, runtime validation with auto-retry, and allergen safety guardrails."),
    ("Q7: How does the app behave when a user generates recipes without internet?", "A7: Generating new recipes displays a friendly offline notification, while the rest of the app (saved favorites and shopping checklist) continues functioning seamlessly."),
    ("Q8: How do CORS and rate limiting protect the application?", "A8: CORS restricts API consumption to the trusted app origin in production, while express-rate-limit prevents denial of service and runaway Gemini API billing."),
    ("Q9: What are the main limitations of the current implementation?", "A9: Pre-trained LLMs may misjudge cooking times slightly, allergen safety requires manual user review, and recipe generation strictly requires active internet connectivity."),
    ("Q10: How can output reliability and accuracy be evaluated at scale?", "A10: By running automated batch benchmarks against hundreds of synthetic pantry inputs, measuring adherence to dietary tags, time bounds, and ingredient match percentages.")
]

# Left Column (5 Q&As)
c_qal = add_card(s16, Inches(0.8), Inches(1.85), Inches(5.7), Inches(5.1), COLOR_CARD_BG, COLOR_BORDER)
tf_qal = c_qal.text_frame
tf_qal.margin_left = tf_qal.margin_right = Inches(0.2)
tf_qal.margin_top = Inches(0.15)
for idx, (q, a) in enumerate(qas_left):
    p_q = tf_qal.paragraphs[0] if idx == 0 else tf_qal.add_paragraph()
    p_q.text = q
    p_q.font.name = FONT_BODY
    p_q.font.size = Pt(8.5)
    p_q.font.bold = True
    p_q.font.color.rgb = COLOR_PAPRIKA
    p_q.space_before = Pt(0) if idx == 0 else Pt(4)
    
    p_a = tf_qal.add_paragraph()
    p_a.text = a
    p_a.font.name = FONT_BODY
    p_a.font.size = Pt(8)
    p_a.font.color.rgb = COLOR_ESPRESSO
    p_a.space_before = Pt(1)

# Right Column (5 Q&As)
c_qar = add_card(s16, Inches(6.8), Inches(1.85), Inches(5.7), Inches(5.1), COLOR_CARD_BG, COLOR_BORDER)
tf_qar = c_qar.text_frame
tf_qar.margin_left = tf_qar.margin_right = Inches(0.2)
tf_qar.margin_top = Inches(0.15)
for idx, (q, a) in enumerate(qas_right):
    p_q = tf_qar.paragraphs[0] if idx == 0 else tf_qar.add_paragraph()
    p_q.text = q
    p_q.font.name = FONT_BODY
    p_q.font.size = Pt(8.5)
    p_q.font.bold = True
    p_q.font.color.rgb = COLOR_PAPRIKA
    p_q.space_before = Pt(0) if idx == 0 else Pt(4)
    
    p_a = tf_qar.add_paragraph()
    p_a.text = a
    p_a.font.name = FONT_BODY
    p_a.font.size = Pt(8)
    p_a.font.color.rgb = COLOR_ESPRESSO
    p_a.space_before = Pt(1)

set_speaker_notes(s16, """[Click 1] Appendix A compiles ten high-probability faculty viva questions covering credential air-gapping, service workers, prompt injection defense, structured JSON schema enforcement, and rate limiting. Each response reflects our production architecture in the codebase, enabling our team to defend our design choices concisely during evaluator questioning.""")

# ==============================================================================
# SLIDE 17: APPENDIX B - Screenshot Gallery
# ==============================================================================
s17 = prs.slides.add_slide(blank_layout)
apply_background_and_transition(s17)
add_header(s17, "APPENDIX B", "High-Resolution Production Screenshot Gallery", "Verified Desktop and Mobile Viewports Captured Directly from Live PWA Application")

# Desktop Column (Left)
add_device_laptop(s17, Inches(0.8), Inches(1.85), Inches(3.6), Inches(2.4), "desktop-home.png", "1. Desktop Home View")
add_device_laptop(s17, Inches(4.7), Inches(1.85), Inches(3.6), Inches(2.4), "desktop-results.png", "2. Desktop Generated Recipes (demo data)")
add_device_laptop(s17, Inches(8.6), Inches(1.85), Inches(3.6), Inches(2.4), "desktop-favorites.png", "3. Desktop Saved Favorites (demo data)")

# Mobile Row (Bottom)
add_device_phone(s17, Inches(0.8), Inches(4.55), Inches(1.6), Inches(2.4), "mobile-filters.png", "4. Filters (emulated)")
add_device_phone(s17, Inches(2.8), Inches(4.55), Inches(1.6), Inches(2.4), "mobile-loading.png", "5. Skeleton (emulated)")
add_device_phone(s17, Inches(4.8), Inches(4.55), Inches(1.6), Inches(2.4), "mobile-recipe-detail.png", "6. Detail (demo data)")
add_device_phone(s17, Inches(6.8), Inches(4.55), Inches(1.6), Inches(2.4), "mobile-shopping.png", "7. Shopping (demo data)")
add_device_phone(s17, Inches(8.8), Inches(4.55), Inches(1.6), Inches(2.4), "mobile-error.png", "8. 503 Error (emulated)")
add_device_phone(s17, Inches(10.8), Inches(4.55), Inches(1.6), Inches(2.4), "mobile-offline.png", "9. Offline View (demo data)")

set_speaker_notes(s17, """[Click 1] Appendix B showcases our complete screenshot gallery across desktop and mobile form factors. All images represent real application UI captured via automated Playwright scripts under light theme. Captions clearly distinguish between initial empty states, emulated mobile views, and demo recipe data.""")

# ==============================================================================
# SLIDE 18: APPENDIX C - Glossary & References
# ==============================================================================
s18 = prs.slides.add_slide(blank_layout)
apply_background_and_transition(s18)
add_header(s18, "APPENDIX C", "Technical Glossary & Academic References", "Foundational Web Engineering and Applied Artificial Intelligence Terminology")

# Left Column: Glossary
c_glo = add_card(s18, Inches(0.8), Inches(1.85), Inches(5.7), Inches(5.1), COLOR_CARD_BG, COLOR_BORDER)
tf_glo = c_glo.text_frame
tf_glo.margin_left = tf_glo.margin_right = Inches(0.25)
tf_glo.margin_top = Inches(0.18)

p_glh = tf_glo.paragraphs[0]
p_glh.text = "TECHNICAL GLOSSARY"
p_glh.font.name = FONT_BODY
p_glh.font.size = Pt(11)
p_glh.font.bold = True
p_glh.font.color.rgb = COLOR_PAPRIKA

glossary_terms = [
    ("Progressive Web App (PWA)", "A web app using modern web capabilities to deliver app-like experiences, installability, and offline access."),
    ("Service Worker", "A background script executing separately from web pages, intercepting network requests and caching assets."),
    ("Web App Manifest", "A JSON metadata file providing browser instructions for home-screen installation, icons, and display mode."),
    ("Structured JSON Output", "Constraining LLM responses to conform to an explicit machine-readable JSON schema at inference time."),
    ("Prompt Injection", "An adversarial exploit where user input attempts to override system instructions or alter model behavior."),
    ("CORS Restriction", "Cross-Origin Resource Sharing security headers preventing unauthorized domains from requesting backend APIs."),
    ("Rate Limiting", "Throttling client request frequency to protect backend infrastructure and prevent runaway API token billing."),
    ("Environment Variable", "Dynamic configuration variables stored on the host OS rather than committed into code repositories.")
]

for term, definition in glossary_terms:
    p = tf_glo.add_paragraph()
    p.text = f"• {term}: {definition}"
    p.font.name = FONT_BODY
    p.font.size = Pt(8)
    p.font.color.rgb = COLOR_ESPRESSO
    p.space_before = Pt(3)

# Right Column: References
c_ref = add_card(s18, Inches(6.8), Inches(1.85), Inches(5.7), Inches(5.1), COLOR_CARD_TINT, COLOR_BORDER)
tf_ref = c_ref.text_frame
tf_ref.margin_left = tf_ref.margin_right = Inches(0.25)
tf_ref.margin_top = Inches(0.18)

p_rfh = tf_ref.paragraphs[0]
p_rfh.text = "ACADEMIC & TECHNICAL REFERENCES"
p_rfh.font.name = FONT_BODY
p_rfh.font.size = Pt(11)
p_rfh.font.bold = True
p_rfh.font.color.rgb = COLOR_BASIL

ref_items = [
    ("Google DeepMind (2024)", "Gemini: A Family of Highly Capable Multimodal Models. Technical Report, Google AI."),
    ("Mozilla Developer Network (2024)", "Progressive Web Applications: Core Architecture, Service Workers, and Web Manifests. MDN Web Docs."),
    ("OWASP Foundation (2024)", "OWASP Top 10 for Large Language Model Applications: LLM01 Prompt Injection & LLM02 Sensitive Information Disclosure."),
    ("Zod Library Documentation (2024)", "TypeScript-first schema declaration and validation with static type inference."),
    ("User Literature Placeholder", "[Add 2 to 3 real references: e.g. college textbook, published paper, or specific conference proceeding]")
]
for author, title in ref_items:
    p = tf_ref.add_paragraph()
    p.text = f"• {author}\n   {title}"
    p.font.name = FONT_BODY
    p.font.size = Pt(8.5)
    p.font.color.rgb = COLOR_ESPRESSO
    p.space_before = Pt(6)

set_speaker_notes(s18, """[Click 1] Appendix C provides a concise glossary defining key concepts from Progressive Web Apps and service workers to structured JSON output and prompt injection defense. It also includes academic citations from Google DeepMind, MDN, and OWASP to anchor PantryChef within contemporary computer science and applied artificial intelligence literature.""")

# Save Presentation
prs.save(OUTPUT_PPTX)
print(f"CSE279 Presentation successfully compiled and saved to: {OUTPUT_PPTX}")
