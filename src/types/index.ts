export interface GithubLabel {
  name: string;
  color: string;
  description?: string;
}

/**
 * Interface for a file in a pull request
 */
export interface PullRequestFile {
  name: string;
  status: 'added' | 'modified' | 'removed';
  additions: number;
  deletions: number;
  changes: number;
  patch?: string;
}

/**
 * Interface for detailed pull request information
 */
export interface PullRequestDetails {
  title: string;
  description: string;
  files: PullRequestFile[];
  repo: string;
}

/**
 * Interface for detailed issue information
 */
export interface IssueDetails {
  title: string;
  description: string;
  repo: string;
  state: 'open' | 'closed';
  created_at: string;
  updated_at: string;
}

/**
 * Interface for AI-generated issue suggestions
 */
export interface IssueSuggestion {
  labels: Array<{
    name: string;
    description: string;
    confidence: number;
    isNew: boolean;
  }>;
  description: {
    en: {
      content: string;
      confidence: number;
    };
    pl: {
      content: string;
      confidence: number;
    };
  };
}
