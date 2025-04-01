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
