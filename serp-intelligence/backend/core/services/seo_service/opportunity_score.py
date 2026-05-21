def calculate_opportunity_score(

    content_gap,

    intent_score,

    competition_score

):

    score = (
        content_gap * intent_score
    ) / (competition_score + 1)

    return round(score, 2)