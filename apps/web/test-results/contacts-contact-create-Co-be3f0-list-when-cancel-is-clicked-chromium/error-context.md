# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e4]:
    - img [ref=e6]
    - heading "Unauthorized Access" [level=1] [ref=e8]
    - generic [ref=e9]:
      - paragraph [ref=e10]: You need to be signed in to access this page.
      - paragraph [ref=e12]: Your session may have expired or you don't have permission to view this content.
    - generic [ref=e13]:
      - link "Sign In" [ref=e14] [cursor=pointer]:
        - /url: /login
      - button "Go Back" [ref=e15] [cursor=pointer]
      - link "Go to Homepage" [ref=e16] [cursor=pointer]:
        - /url: /
    - paragraph [ref=e18]:
      - text: Need help?
      - link "Contact support" [ref=e19] [cursor=pointer]:
        - /url: mailto:support@relationhub.com
  - alert [ref=e20]
```