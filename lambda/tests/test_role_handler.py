import json
import os
import sys
import unittest
from pathlib import Path
from unittest.mock import Mock, patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from handlers import select_role  # noqa: E402


def event(*, role="agent", groups=""):
    claims = {"sub": "sub-1", "username": "user-1"}
    if groups:
        claims["cognito:groups"] = groups
    return {
        "body": json.dumps({"role": role}),
        "requestContext": {"authorizer": {"jwt": {"claims": claims}}},
    }


class SelectRoleHandlerTests(unittest.TestCase):
    def setUp(self):
        os.environ["COGNITO_USER_POOL_ID"] = "pool-1"
        os.environ["LISTINGS_TABLE"] = "table-1"

    @patch("handlers.select_role._identity_client")
    @patch("handlers.select_role.ListingsRepository")
    def test_assigns_self_declared_role_and_requires_new_token(self, repository_class, identity_factory):
        repository_class.return_value.claim_user_role.return_value = True
        response = select_role.lambda_handler(event(), None)

        self.assertEqual(response["statusCode"], 201)
        body = json.loads(response["body"])
        self.assertEqual(body["role"], "agent")
        self.assertTrue(body["self_declared"])
        self.assertTrue(body["reauthentication_required"])
        identity_factory.return_value.admin_add_user_to_group.assert_called_once_with(
            UserPoolId="pool-1", Username="user-1", GroupName="Agent"
        )

    @patch("handlers.select_role._identity_client")
    @patch("handlers.select_role.ListingsRepository")
    def test_rejects_second_selection_before_cognito_write(self, repository_class, identity_factory):
        repository_class.return_value.claim_user_role.return_value = False
        response = select_role.lambda_handler(event(role="landlord"), None)

        self.assertEqual(response["statusCode"], 409)
        identity_factory.return_value.admin_add_user_to_group.assert_not_called()

    @patch("handlers.select_role._identity_client")
    @patch("handlers.select_role.ListingsRepository")
    def test_existing_posting_group_is_already_selected(self, repository_class, identity_factory):
        response = select_role.lambda_handler(event(groups="Agent"), None)

        self.assertEqual(response["statusCode"], 409)
        repository_class.assert_not_called()
        identity_factory.assert_not_called()

    @patch("handlers.select_role._identity_client")
    @patch("handlers.select_role.ListingsRepository")
    def test_rolls_back_profile_if_cognito_assignment_fails(self, repository_class, identity_factory):
        repository = repository_class.return_value
        repository.claim_user_role.return_value = True
        identity_factory.return_value.admin_add_user_to_group.side_effect = RuntimeError("Cognito unavailable")

        response = select_role.lambda_handler(event(), None)

        self.assertEqual(response["statusCode"], 500)
        repository.rollback_user_role.assert_called_once_with("sub-1")


if __name__ == "__main__":
    unittest.main()
