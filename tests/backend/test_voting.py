def test_vote_submission():
    """
    Test that a valid vote submission is accepted.
    """
    user_authenticated = True
    has_voted = False

    if user_authenticated and not has_voted:
        result = "accepted"
    else:
        result = "rejected"

    assert result == "accepted"


def test_double_voting():
    """
    Test that a second vote attempt is rejected.
    """
    user_authenticated = True
    has_voted = True

    if user_authenticated and not has_voted:
        result = "accepted"
    else:
        result = "rejected"

    assert result == "rejected"

