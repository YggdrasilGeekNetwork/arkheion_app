export const GET_FEEDBACK_ITEMS_QUERY = `
  query {
    feedbackItems {
      id
      title
      description
      status
      progress
      upvotesCount
      upvoted
      createdAt
    }
  }
`

export const SUBMIT_FEEDBACK_MUTATION = `
  mutation SubmitFeedback($title: String!, $description: String) {
    submitFeedback(title: $title, description: $description) {
      feedbackItem {
        id
        title
        description
        status
        upvotesCount
        upvoted
      }
      errors
    }
  }
`

export const TOGGLE_UPVOTE_MUTATION = `
  mutation ToggleUpvote($feedbackItemId: ID!) {
    toggleUpvote(feedbackItemId: $feedbackItemId) {
      feedbackItem {
        id
        upvotesCount
        upvoted
      }
      errors
    }
  }
`
