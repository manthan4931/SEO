from serp.models import SERPResult, PipelineLog
from competitors.models import CompetitorPage
from services.seo_service.title_analysis import analyze_titles
from services.seo_service.heading_analysis import analyze_headings
from services.seo_service.content_depth import analyze_content_depth
from services.seo_service.keyword_gap import keyword_gap_analysis
from services.seo_service.faq_analysis import analyze_faqs
from services.seo_service.cluster_analysis import analyze_semantic_clusters
from services.seo_service.brief_generator import generate_content_brief
from analysis.models import AnalysisReport

def run_full_analysis(keyword):
    serp_results = SERPResult.objects.filter(keyword=keyword)

    if not serp_results.exists():
        from serp.full_serp_pipeline import process_keyword
        process_keyword(keyword.id)
        serp_results = SERPResult.objects.filter(keyword=keyword)

    competitor_pages = CompetitorPage.objects.filter(serp_result__keyword=keyword)

    # TITLES
    titles = [x.title for x in serp_results]
    serp_top_10 = [{"title": r.title, "url": r.url, "snippet": r.meta_description} for r in serp_results]
    # DOCUMENTS
    documents = [x.full_text for x in competitor_pages]

    # ANALYSIS STEPS
    PipelineLog.objects.create(keyword=keyword, message="Starting AI Intelligence Audit...", level='INFO')
    
    PipelineLog.objects.create(keyword=keyword, message="Analyzing Competitor Title Strategies...", level='INFO')
    title_analysis = analyze_titles(titles)
    
    PipelineLog.objects.create(keyword=keyword, message="Mapping Heading Hierarchies & Outlines...", level='INFO')
    heading_analysis = analyze_headings(competitor_pages)
    
    PipelineLog.objects.create(keyword=keyword, message="Evaluating Content Depth & Word Counts...", level='INFO')
    depth_analysis = analyze_content_depth(competitor_pages)
    
    PipelineLog.objects.create(keyword=keyword, message="Identifying Strategic Keyword Gaps...", level='INFO')
    keyword_gaps = keyword_gap_analysis(documents)
    
    PipelineLog.objects.create(keyword=keyword, message="Extracting Competitor FAQs & Intent...", level='INFO')
    faqs = analyze_faqs(documents)
    
    PipelineLog.objects.create(keyword=keyword, message="Generating Semantic Architecture & Map...", level='INFO')
    clusters = analyze_semantic_clusters(competitor_pages)

    # PAA QUESTIONS
    from serp.models import PAAQuestion
    paa_questions = list(PAAQuestion.objects.filter(keyword=keyword).values_list('question', flat=True))

    # FINAL ANALYSIS DATA
    analysis_data = {
        "title_analysis": title_analysis,
        "heading_analysis": heading_analysis,
        "depth_analysis": depth_analysis,
        "keyword_gaps": keyword_gaps,
        "faq_analysis": faqs,
        "cluster_analysis": clusters,
        "paa_questions": paa_questions,
        "suggested_blog_topics": [f"Topic {i}" for i in range(5)] # Placeholder, will be populated by AI in brief
    }

    # AI CONTENT BRIEF
    PipelineLog.objects.create(keyword=keyword, message="Synthesizing Final AI Content Brief & Strategic Roadmap...", level='INFO')
    try:
        content_brief = generate_content_brief(analysis_data)
    except Exception as e:
        print(f"Brief generation failed: {e}")
        content_brief = "# Analysis Complete\n\nAI Brief generation failed, but technical analysis is available below."
        PipelineLog.objects.create(keyword=keyword, message=f"AI Brief failed: {e}. Technical data saved.", level='ERROR')

    report = AnalysisReport.objects.create(
        keyword=keyword,
        report_data={
            "analysis": analysis_data, 
            "content_brief": content_brief,
            "serp_top_10": serp_top_10
        }
    )
    
    PipelineLog.objects.create(keyword=keyword, message="Analysis Report Generated Successfully. Intelligence Ready.", level='SUCCESS')
    
    return {
        "analysis": analysis_data,
        "content_brief": content_brief,
        "report_id": report.id
    }
