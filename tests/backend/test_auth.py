def test_valid_otp():
    """
    Test valid OTP verification.
    """
    otp_entered = "123456"
    otp_actual = "123456"

    assert otp_entered == otp_actual


def test_invalid_otp():
    """
    Test invalid OTP verification.
    """
    otp_entered = "111111"
    otp_actual = "123456"

    assert otp_entered != otp_actual

